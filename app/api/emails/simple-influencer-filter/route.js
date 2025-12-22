import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import Imap from "imap";
import { simpleParser } from "mailparser";
import crypto from "crypto";
import {
  formatEmailForStorage,
  normalizeEmail as normalizeEmailUtil,
} from "../../../../lib/emailUtils";


// 글로벌 진행상황 저장소 (progress API와 공유)
let progressStore;
if (global.progressStore) {
  progressStore = global.progressStore;
} else {
  progressStore = new Map();
  global.progressStore = progressStore;
}

// 진행상황 업데이트 함수
async function updateProgress(userId, progressData) {
  try {
    // 메모리에 직접 저장 (API 호출 대신)
    progressStore.set(userId, {
      ...progressData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    // 진행상황 업데이트 실패는 조용히 무시
  }
}

/**
 * 단순한 이메일 수신 및 인플루언서 필터링
 * 1. SMTP/IMAP으로 모든 메일 가져오기
 * 2. 인플루언서 이메일 필터링
 * 3. 매칭된 메일만 데이터베이스 저장
 */

/**
 * Gmail IMAP 설정
 */
function createGmailImapConfig(user) {
  return {
    user: user.gmailSmtpUser,
    password: user.gmailSmtpPassword,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    authTimeout: 10000,
    connTimeout: 15000,
    keepalive: false,
    tlsOptions: {
      servername: "imap.gmail.com",
      rejectUnauthorized: false,
    },
  };
}

/**
 * Mailplug IMAP 설정
 */
function createMailplugImapConfig(user) {
  return {
    user: user.mailplugSmtpUser,
    password: user.mailplugSmtpPassword,
    host: "imap.mailplug.co.kr",
    port: 993,
    tls: true,
    authTimeout: 10000,
    connTimeout: 15000,
    keepalive: false,
    tlsOptions: {
      servername: "imap.mailplug.co.kr",
      rejectUnauthorized: false,
    },
  };
}

/**
 * IMAP으로 메일 가져오기 (단순화된 버전)
 */
function fetchEmailsViaImap(config, provider) {
  return new Promise((resolve, reject) => {
    const imap = new Imap(config);
    const emails = [];
    let isResolved = false;

    const timeout = setTimeout(() => {
      if (!isResolved) {
        console.error(`❌ ${provider} IMAP 타임아웃 (5분)`);
        isResolved = true;
        imap.end();
        reject(new Error(`${provider} IMAP timeout`));
      }
    }, 300000); // 5분으로 연장

    function cleanup() {
      clearTimeout(timeout);
      if (imap.state !== "disconnected") {
        imap.end();
      }
    }

    function finishWithResults() {
      if (isResolved) return;
      isResolved = true;
      cleanup();
      resolve(emails);
    }

    imap.once("ready", function () {

      imap.openBox("INBOX", true, function (err, box) {
        if (err) {
          console.error(`❌ ${provider} INBOX 열기 실패:`, err);
          if (!isResolved) {
            isResolved = true;
            cleanup();
            reject(err);
          }
          return;
        }


        if (box.messages.total === 0) {
          finishWithResults();
          return;
        }

        let processedCount = 0;
        const fetch = imap.seq.fetch("1:*", {
          bodies: "",
          struct: true,
        });

        fetch.on("message", function (msg, seqno) {
          let buffer = "";

          msg.on("body", function (stream) {
            stream.on("data", function (chunk) {
              buffer += chunk.toString("utf8");
            });

            stream.once("end", function () {
              simpleParser(buffer)
                .then((parsed) => {
                  const fromRaw =
                    parsed.from?.text ||
                    parsed.from?.value?.[0]?.address ||
                    "발신자 불명";
                  const toRaw =
                    parsed.to?.text ||
                    parsed.to?.value?.[0]?.address ||
                    "";

                  const email = {
                    messageId: parsed.messageId,
                    from: formatEmailForStorage(fromRaw) || fromRaw,
                    to: formatEmailForStorage(toRaw) || toRaw,
                    subject: parsed.subject || "(제목 없음)",
                    date: parsed.date || new Date(),
                    text: parsed.text,
                    html: parsed.html,
                    attachments: parsed.attachments || [],
                    headers: parsed.headers,
                    provider: provider,
                  };


                  emails.push(email);
                  processedCount++;


                  if (processedCount === box.messages.total) {
                    finishWithResults();
                  }
                })
                .catch((parseErr) => {
                  console.error(`❌ ${provider} 메일 파싱 실패 (seqno: ${seqno}):`, parseErr);
                  processedCount++;


                  if (processedCount === box.messages.total) {
                    finishWithResults();
                  }
                });
            });
          });
        });

        fetch.once("error", function (err) {
          console.error(`❌ ${provider} 메일 가져오기 실패:`, err);
          if (!isResolved) {
            isResolved = true;
            cleanup();
            reject(err);
          }
        });
      });
    });

    imap.once("error", function (err) {
      console.error(`❌ ${provider} IMAP 연결 오류:`, err);
      if (!isResolved) {
        isResolved = true;
        cleanup();
        reject(err);
      }
    });

    imap.connect();
  });
}

/**
 * 이메일 정규화
 */
function normalizeEmail(email) {
  return normalizeEmailUtil(email);
}

/**
 * 인플루언서 이메일인지 확인
 */
function checkInfluencerEmail(fromEmail, toEmail, influencers) {
  const normalizedFrom = normalizeEmail(fromEmail);
  const normalizedTo = normalizeEmail(toEmail);

  for (const influencer of influencers) {
    const influencerEmail = normalizeEmail(influencer.email);
    if (!influencerEmail) continue;

    if (normalizedFrom === influencerEmail || normalizedTo === influencerEmail) {
      return influencer;
    }
  }

  return null;
}

/**
 * 고유 ID 생성
 */
function generateUniqueId(email, provider) {
  const data = `${email.messageId || ""}-${email.from}-${email.subject}-${email.date}-${provider}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * POST /api/emails/simple-influencer-filter
 * 단순한 인플루언서 메일 필터링 및 저장
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }


    // 진행상황 초기화
    await updateProgress(userId, {
      stage: '초기화',
      message: '사용자 정보 및 인플루언서 목록을 조회 중입니다...',
      progress: 5,
      totalEmails: 0,
      processedEmails: 0,
      matchedEmails: 0,
      errors: [],
      isComplete: false
    });

    // 1. 사용자 및 인플루언서 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      await updateProgress(userId, {
        stage: '오류',
        message: '사용자를 찾을 수 없습니다.',
        progress: 0,
        errors: ['사용자를 찾을 수 없습니다.'],
        isComplete: true
      });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const influencers = await prisma.influencer.findMany({
      where: {
        userId: parseInt(userId),
        email: { not: null },
      },
    });


    await updateProgress(userId, {
      stage: '메일 가져오기',
      message: `${influencers.length}명의 인플루언서 정보를 확인했습니다. 메일을 가져오는 중...`,
      progress: 10,
      totalEmails: 0,
      processedEmails: 0,
      matchedEmails: 0,
      errors: [],
      isComplete: false
    });

    // 2. SMTP/IMAP으로 모든 메일 가져오기
    const allEmails = [];
    const errors = [];

    // Gmail 메일 가져오기
    if (user.gmailSmtpUser && user.gmailSmtpPassword) {
      try {
        await updateProgress(userId, {
          stage: '메일 가져오기',
          message: 'Gmail 메일을 가져오는 중...',
          progress: 20,
          totalEmails: 0,
          processedEmails: 0,
          matchedEmails: 0,
          errors: [],
          isComplete: false
        });

        const gmailConfig = createGmailImapConfig(user);
        const gmailEmails = await fetchEmailsViaImap(gmailConfig, "Gmail");
        allEmails.push(...gmailEmails);
      } catch (error) {
        console.error("Gmail 메일 가져오기 실패:", error);
        errors.push({ provider: "Gmail", error: error.message });
      }
    }

    // Mailplug 메일 가져오기
    if (user.mailplugSmtpUser && user.mailplugSmtpPassword) {
      try {
        await updateProgress(userId, {
          stage: '메일 가져오기',
          message: 'Mailplug 메일을 가져오는 중...',
          progress: 40,
          totalEmails: allEmails.length,
          processedEmails: 0,
          matchedEmails: 0,
          errors: errors.length > 0 ? errors.map(e => e.error) : [],
          isComplete: false
        });

        const mailplugConfig = createMailplugImapConfig(user);
        const mailplugEmails = await fetchEmailsViaImap(mailplugConfig, "Mailplug");
        allEmails.push(...mailplugEmails);
      } catch (error) {
        console.error("Mailplug 메일 가져오기 실패:", error);
        errors.push({ provider: "Mailplug", error: error.message });
      }
    }


    await updateProgress(userId, {
      stage: '메일 처리',
      message: `총 ${allEmails.length}개의 메일을 수집했습니다. 인플루언서 메일을 필터링하는 중...`,
      progress: 60,
      totalEmails: allEmails.length,
      processedEmails: 0,
      matchedEmails: 0,
      errors: errors.length > 0 ? errors.map(e => e.error) : [],
      isComplete: false
    });

    if (allEmails.length === 0) {
      await updateProgress(userId, {
        stage: '완료',
        message: '가져온 메일이 없습니다.',
        progress: 100,
        totalEmails: 0,
        processedEmails: 0,
        matchedEmails: 0,
        errors: errors.length > 0 ? errors.map(e => e.error) : [],
        isComplete: true,
        stats: {
          totalFetched: 0,
          matched: 0,
          saved: 0,
          duplicates: 0,
        }
      });

      return NextResponse.json({
        success: true,
        message: "No emails found",
        stats: {
          totalFetched: 0,
          matched: 0,
          saved: 0,
          duplicates: 0,
        },
        errors: errors.length > 0 ? errors : undefined,
      });
    }

    // 3. 인플루언서 이메일 필터링 (배열에 수집)
    const emailsToSave = [];
    const duplicates = [];
    let matchedCount = 0;
    let processedCount = 0;


    for (const email of allEmails) {
      processedCount++;

      // 인플루언서 매칭 확인
      const matchedInfluencer = checkInfluencerEmail(
        email.from,
        email.to,
        influencers
      );

      if (matchedInfluencer) {
        matchedCount++;

        // 고유 ID 생성
        const uniqueId = generateUniqueId(email, email.provider);

        // 중복 확인
        const existing = await prisma.emailReceived.findUnique({
          where: {
            userId_uniqueId: {
              userId: parseInt(userId),
              uniqueId: uniqueId,
            },
          },
        });

        if (existing) {
          duplicates.push({
            subject: email.subject,
            from: email.from,
            provider: email.provider,
          });
          continue;
        }

        // 배열에 저장할 데이터 준비
        emailsToSave.push({
          userId: parseInt(userId),
          messageId: email.messageId?.toString(),
          uniqueId: uniqueId,
          from: email.from,
          to: email.to,
          subject: email.subject,
          textContent: email.text,
          htmlContent: email.html,
          attachments: email.attachments?.length > 0 ? email.attachments : null,
          headers: email.headers ? Object.fromEntries(email.headers) : null,
          originalDate: email.date,
          receivedAt: new Date(),
          provider: email.provider,
          influencerId: matchedInfluencer.id,
          isInfluencer: true,
          // 응답용 데이터도 함께 저장
          _influencer: {
            id: matchedInfluencer.id,
            accountId: matchedInfluencer.accountId,
            email: matchedInfluencer.email,
          }
        });

        // 상세 로그는 주석 처리 (필요시 활성화)
        // console.log(`📧 필터링 완료: [${email.provider}] ${email.from} → ${email.to} | ${email.subject} | 인플루언서: ${matchedInfluencer.accountId}`);
      }

      // 10개씩 처리할 때마다 진행상황 업데이트
      if (processedCount % 10 === 0 || processedCount === allEmails.length) {
        const currentProgress = 60 + (processedCount / allEmails.length * 20); // 60%~80%
        await updateProgress(userId, {
          stage: '메일 필터링',
          message: `메일 필터링 중... (${processedCount}/${allEmails.length})`,
          progress: Math.round(currentProgress),
          totalEmails: allEmails.length,
          processedEmails: processedCount,
          matchedEmails: matchedCount,
          errors: errors.length > 0 ? errors.map(e => e.error || e) : [],
          isComplete: false
        });
      }
    }


    // 4. 배치로 데이터베이스에 저장
    const savedEmails = [];

    if (emailsToSave.length > 0) {
      await updateProgress(userId, {
        stage: '데이터베이스 저장',
        message: `${emailsToSave.length}개의 메일을 데이터베이스에 저장하는 중...`,
        progress: 85,
        totalEmails: allEmails.length,
        processedEmails: allEmails.length,
        matchedEmails: matchedCount,
        errors: errors.length > 0 ? errors.map(e => e.error || e) : [],
        isComplete: false
      });

      try {

        // createMany를 사용하여 한번에 저장
        const dbEmails = emailsToSave.map(email => {
          const { _influencer, ...dbData } = email; // _influencer 제거
          return dbData;
        });

        const result = await prisma.emailReceived.createMany({
          data: dbEmails,
          skipDuplicates: true // 중복 건너뛰기
        });


        // 응답용 데이터 구성
        savedEmails.push(...emailsToSave.map(email => ({
          from: email.from,
          subject: email.subject,
          provider: email.provider,
          influencer: email._influencer
        })));

      } catch (saveError) {
        console.error('❌ 배치 저장 실패:', saveError);
        errors.push({
          error: `배치 저장 실패: ${saveError.message}`,
        });
      }
    }


    // 최종 완료 상태 업데이트
    const finalStats = {
      totalFetched: allEmails.length,
      matched: matchedCount,
      saved: savedEmails.length,
      duplicates: duplicates.length,
      influencerCount: influencers.length,
    };

    await updateProgress(userId, {
      stage: '완료',
      message: `메일 수신 완료! 총 ${allEmails.length}개 중 ${savedEmails.length}개의 인플루언서 메일을 저장했습니다.`,
      progress: 100,
      totalEmails: allEmails.length,
      processedEmails: allEmails.length,
      matchedEmails: matchedCount,
      errors: errors.length > 0 ? errors.map(e => e.error || e) : [],
      isComplete: true,
      stats: finalStats,
      savedEmails: savedEmails
    });

    return NextResponse.json({
      success: true,
      message: "Influencer email filtering completed",
      stats: finalStats,
      savedEmails: savedEmails,
      duplicatesPreview: duplicates.slice(0, 5),
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error("Simple influencer filtering error:", error);

    // 오류 상태 업데이트
    await updateProgress(userId, {
      stage: '오류',
      message: '메일 수신 중 오류가 발생했습니다.',
      progress: 0,
      totalEmails: 0,
      processedEmails: 0,
      matchedEmails: 0,
      errors: [error.message],
      isComplete: true
    });

    return NextResponse.json(
      {
        error: "Failed to filter influencer emails",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
