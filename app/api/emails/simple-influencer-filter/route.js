import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";
import Imap from "imap";
import { simpleParser } from "mailparser";
import crypto from "crypto";
import {
  formatEmailForStorage,
  normalizeEmail as normalizeEmailUtil,
} from "../../../../lib/emailUtils";

const prisma = new PrismaClient();

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
      console.log(`✅ ${provider} 메일 수신 완료: ${emails.length}개 (${new Date().toLocaleTimeString()})`);
      resolve(emails);
    }

    imap.once("ready", function () {
      console.log(`🔌 ${provider} IMAP 연결 성공`);

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

        console.log(`📬 ${provider} INBOX - 총 메일: ${box.messages.total}개`);

        if (box.messages.total === 0) {
          finishWithResults();
          return;
        }

        console.log(`🔄 ${provider} 메일 파싱 시작... (5분 타임아웃)`);
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

                  // 10개마다 진행상황 출력
                  if (processedCount % 10 === 0) {
                    console.log(`📈 [${provider}] 진행상황: ${processedCount}/${box.messages.total} (${Math.round(processedCount / box.messages.total * 100)}%)`);
                  }

                  if (processedCount === box.messages.total) {
                    finishWithResults();
                  }
                })
                .catch((parseErr) => {
                  console.error(`❌ ${provider} 메일 파싱 실패 (seqno: ${seqno}):`, parseErr);
                  processedCount++;

                  // 10개마다 진행상황 출력 (파싱 실패 케이스도 포함)
                  if (processedCount % 10 === 0) {
                    console.log(`📈 [${provider}] 진행상황: ${processedCount}/${box.messages.total} (${Math.round(processedCount / box.messages.total * 100)}%)`);
                  }

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

    console.log(`🔄 ${provider} IMAP 연결 시도 중...`);
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

    console.log(`🎯 단순 인플루언서 필터링 시작 - 사용자: ${userId}`);

    // 1. 사용자 및 인플루언서 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const influencers = await prisma.influencer.findMany({
      where: {
        userId: parseInt(userId),
        email: { not: null },
      },
    });

    console.log(`👥 인플루언서 ${influencers.length}명 조회 완료`);

    // 2. SMTP/IMAP으로 모든 메일 가져오기
    const allEmails = [];
    const errors = [];

    // Gmail 메일 가져오기
    if (user.gmailSmtpUser && user.gmailSmtpPassword) {
      try {
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
        const mailplugConfig = createMailplugImapConfig(user);
        const mailplugEmails = await fetchEmailsViaImap(mailplugConfig, "Mailplug");
        allEmails.push(...mailplugEmails);
      } catch (error) {
        console.error("Mailplug 메일 가져오기 실패:", error);
        errors.push({ provider: "Mailplug", error: error.message });
      }
    }

    console.log(`📧 전체 메일 수집 완료: ${allEmails.length}개`);

    if (allEmails.length === 0) {
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

    // 3. 인플루언서 이메일 필터링 및 저장
    const savedEmails = [];
    const duplicates = [];
    let matchedCount = 0;

    for (const email of allEmails) {
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

        // 데이터베이스에 저장
        try {
          const savedEmail = await prisma.emailReceived.create({
            data: {
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
            },
          });

          savedEmails.push({
            id: savedEmail.id,
            from: savedEmail.from,
            subject: savedEmail.subject,
            provider: savedEmail.provider,
            influencer: {
              id: matchedInfluencer.id,
              accountId: matchedInfluencer.accountId,
              email: matchedInfluencer.email,
            },
          });

          console.log(`💾 DB 저장: [${email.provider}] ${email.from} → ${email.to} | ${email.subject} | 인플루언서: ${matchedInfluencer.accountId}`);
        } catch (saveError) {
          console.error(`저장 실패: ${email.subject}`, saveError);
          errors.push({
            email: email.subject,
            error: saveError.message,
          });
        }
      }
    }

    console.log(`✅ 처리 완료 - 전체: ${allEmails.length}개, 매칭: ${matchedCount}개, 저장: ${savedEmails.length}개`);

    return NextResponse.json({
      success: true,
      message: "Influencer email filtering completed",
      stats: {
        totalFetched: allEmails.length,
        matched: matchedCount,
        saved: savedEmails.length,
        duplicates: duplicates.length,
        influencerCount: influencers.length,
      },
      savedEmails: savedEmails,
      duplicatesPreview: duplicates.slice(0, 5),
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error("Simple influencer filtering error:", error);
    return NextResponse.json(
      {
        error: "Failed to filter influencer emails",
        details: error.message,
      },
      { status: 500 }
    );
  }
}