import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";
import Imap from "imap";
import { simpleParser } from "mailparser";
import crypto from "crypto";
import {
  extractEmailAddresses,
  formatEmailForStorage,
  normalizeEmail as normalizeEmailUtil,
} from "../../../../lib/emailUtils";

const prisma = new PrismaClient();

/**
 * Gmail IMAP 연결을 위한 설정
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
 * Mailplug IMAP 연결을 위한 설정
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
 * Gmail IMAP으로 메일 가져오기
 */
function fetchGmailEmailsViaImap(config, options = {}) {
  return new Promise((resolve, reject) => {
    const imap = new Imap(config);
    const emails = [];
    let isResolved = false;

    const globalTimeout = setTimeout(() => {
      if (!isResolved) {
        console.error("❌ Gmail IMAP 전체 작업 타임아웃 (30초)");
        isResolved = true;
        imap.end();
        reject(new Error("Gmail IMAP operation timeout"));
      }
    }, 30000);

    function cleanup() {
      clearTimeout(globalTimeout);
      if (imap.state !== "disconnected") {
        imap.end();
      }
    }

    function finishWithResults() {
      if (isResolved) return;
      isResolved = true;
      cleanup();

      emails.sort((a, b) => new Date(b.date) - new Date(a.date));
      resolve(emails);
    }

    imap.once("ready", function () {
      imap.openBox("INBOX", true, function (err, box) {
        if (err) {
          console.error("❌ Gmail INBOX 열기 실패:", err);
          if (!isResolved) {
            isResolved = true;
            cleanup();
            reject(err);
          }
          return;
        }

        if (box.messages.total === 0) {
          console.log("📭 Gmail 받은 메일이 없습니다");
          finishWithResults();
          return;
        }

        const fetchRange = "1:*";

        let emailCount = 0;
        let processedCount = 0;
        const emailBuffers = new Map();

        const fetch = imap.seq.fetch(fetchRange, {
          bodies: "",
          struct: true,
        });

        fetch.on("message", function (msg, seqno) {
          emailCount++;
          let buffer = "";

          msg.on("body", function (stream, info) {
            stream.on("data", function (chunk) {
              buffer += chunk.toString("utf8");
            });

            stream.once("end", function () {
              emailBuffers.set(seqno, buffer);
              processedCount++;

              if (processedCount === emailCount) {
                processAllEmails();
              }
            });
          });
        });

        function processAllEmails() {
          const promises = [];

          emailBuffers.forEach((buffer, seqno) => {
            const promise = simpleParser(buffer)
              .then((parsed) => {
                // 이메일 주소 추출
                const fromRaw =
                  parsed.from?.text ||
                  parsed.from?.value?.[0]?.address ||
                  "발신자 불명";
                const toRaw =
                  parsed.to?.text || parsed.to?.value?.[0]?.address || "";

                const fromEmail = formatEmailForStorage(fromRaw);
                const toEmail = formatEmailForStorage(toRaw);

                return {
                  messageId: parsed.messageId,
                  from: fromEmail || fromRaw,
                  to: toEmail || toRaw,
                  subject: parsed.subject || "(제목 없음)",
                  date: parsed.date || new Date(),
                  text: parsed.text,
                  html: parsed.html,
                  attachments: parsed.attachments || [],
                  headers: parsed.headers,
                };
              })
              .catch((parseErr) => {
                console.error("❌ Gmail 메일 파싱 실패:", parseErr);
                return null;
              });

            promises.push(promise);
          });

          Promise.allSettled(promises).then((results) => {
            results.forEach((result, index) => {
              if (result.status === "fulfilled" && result.value) {
                emails.push(result.value);
              } else if (result.status === "rejected") {
                console.error(`❌ 메일 파싱 실패 (${index}):`, result.reason);
              }
            });

            finishWithResults();
          });
        }

        fetch.once("error", function (err) {
          console.error("❌ Gmail 메일 가져오기 실패:", err);
          if (!isResolved) {
            isResolved = true;
            cleanup();
            reject(err);
          }
        });

        fetch.once("end", function () {
          console.log(`📥 Gmail fetch 완료 - 수집된 메일: ${emailCount}개`);
          if (emailCount === 0) {
            finishWithResults();
          }
          // fetch가 끝났지만 모든 메일 파싱이 완료될 때까지 기다림
          // processAllEmails()가 모든 파싱 완료 후 finishWithResults() 호출
        });
      });
    });

    imap.once("error", function (err) {
      console.error("❌ Gmail IMAP 연결 오류:", err);
      if (!isResolved) {
        isResolved = true;
        cleanup();
        reject(err);
      }
    });

    console.log("🔄 Gmail IMAP 연결 시도 중...");
    imap.connect();
  });
}

/**
 * Mailplug IMAP으로 메일 가져오기
 */
function fetchMailplugEmailsViaImap(config, options = {}) {
  return new Promise((resolve, reject) => {
    const imap = new Imap(config);
    const emails = [];
    let isResolved = false;

    const globalTimeout = setTimeout(() => {
      if (!isResolved) {
        console.error("❌ Mailplug IMAP 전체 작업 타임아웃 (30초)");
        isResolved = true;
        imap.end();
        reject(new Error("Mailplug IMAP operation timeout"));
      }
    }, 30000);

    function cleanup() {
      clearTimeout(globalTimeout);
      if (imap.state !== "disconnected") {
        imap.end();
      }
    }

    function finishWithResults() {
      if (isResolved) return;
      isResolved = true;
      cleanup();

      console.log(`✅ Mailplug 메일 가져오기 완료 - 총 ${emails.length}개`);
      emails.sort((a, b) => new Date(b.date) - new Date(a.date));
      resolve(emails);
    }

    imap.once("ready", function () {
      console.log("✅ Mailplug IMAP 연결 성공");

      imap.openBox("INBOX", true, function (err, box) {
        if (err) {
          console.error("❌ Mailplug INBOX 열기 실패:", err);
          if (!isResolved) {
            isResolved = true;
            cleanup();
            reject(err);
          }
          return;
        }

        console.log(
          `📬 Mailplug INBOX 열기 성공 - 총 메일: ${box.messages.total}개`
        );

        if (box.messages.total === 0) {
          console.log("📭 Mailplug 받은 메일이 없습니다");
          finishWithResults();
          return;
        }

        const fetchRange = "1:*";
        console.log(
          `📨 Mailplug 모든 메일 가져오는 중... (총 ${box.messages.total}개)`
        );

        let emailCount = 0;
        let processedCount = 0;
        const emailBuffers = new Map();

        const fetch = imap.seq.fetch(fetchRange, {
          bodies: "",
          struct: true,
        });

        fetch.on("message", function (msg, seqno) {
          emailCount++;
          let buffer = "";

          msg.on("body", function (stream, info) {
            stream.on("data", function (chunk) {
              buffer += chunk.toString("utf8");
            });

            stream.once("end", function () {
              emailBuffers.set(seqno, buffer);
              processedCount++;

              if (processedCount === emailCount) {
                processAllEmails();
              }
            });
          });
        });

        function processAllEmails() {
          const promises = [];

          emailBuffers.forEach((buffer, seqno) => {
            const promise = simpleParser(buffer)
              .then((parsed) => {
                const fromRaw =
                  parsed.from?.text ||
                  parsed.from?.value?.[0]?.address ||
                  "발신자 불명";
                const toRaw =
                  parsed.to?.text || parsed.to?.value?.[0]?.address || "";

                const fromEmail = formatEmailForStorage(fromRaw);
                const toEmail = formatEmailForStorage(toRaw);

                const processedEmail = {
                  id: `mailplug-${seqno}-${Date.now()}`,
                  messageId: parsed.messageId,
                  from: fromEmail || fromRaw,
                  to: toEmail || toRaw,
                  subject: parsed.subject || "(제목 없음)",
                  date: parsed.date || new Date(),
                  textContent: parsed.text,
                  htmlContent: parsed.html,
                  attachments: parsed.attachments || [],
                  headers: parsed.headers,
                  hasAttachments: !!(
                    parsed.attachments && parsed.attachments.length > 0
                  ),
                  preview: parsed.text
                    ? parsed.text.substring(0, 150) + "..."
                    : "",
                  isRead: false,
                  receivedAt: new Date().toISOString(),
                  isNewEmail: true,
                  isMailplugEmail: true,
                  contentLength: parsed.text ? parsed.text.length : 0,
                  provider: "mailplug",
                };

                return processedEmail;
              })
              .catch((parseErr) => {
                console.error("❌ Mailplug 메일 파싱 실패:", parseErr);
                return null;
              });

            promises.push(promise);
          });

          Promise.allSettled(promises).then((results) => {
            results.forEach((result, index) => {
              if (result.status === "fulfilled" && result.value) {
                emails.push(result.value);
              } else if (result.status === "rejected") {
                console.error(`❌ Mailplug 메일 파싱 실패 (${index}):`, result.reason);
              }
            });

            console.log(`✅ Mailplug 최종 처리된 메일: ${emails.length}개`);
            finishWithResults();
          });
        }

        fetch.once("error", function (err) {
          console.error("❌ Mailplug 메일 가져오기 실패:", err);
          if (!isResolved) {
            isResolved = true;
            cleanup();
            reject(err);
          }
        });

        fetch.once("end", function () {
          console.log(`📥 Mailplug fetch 완료 - 수집된 메일: ${emailCount}개`);
          if (emailCount === 0) {
            finishWithResults();
          }
          // fetch가 끝났지만 모든 메일 파싱이 완료될 때까지 기다림
          // processAllEmails()가 모든 파싱 완료 후 finishWithResults() 호출
        });
      });
    });

    imap.once("error", function (err) {
      console.error("❌ Mailplug IMAP 연결 오류:", err);
      if (!isResolved) {
        isResolved = true;
        cleanup();
        reject(err);
      }
    });

    console.log("🔄 Mailplug IMAP 연결 시도 중...");
    imap.connect();
  });
}

/**
 * 인플루언서 이메일인지 확인을 위한 정규화 함수 (emailUtils의 normalizeEmail 사용)
 */
function normalizeEmail(email) {
  return normalizeEmailUtil(email);
}

/**
 * 인플루언서 이메일인지 확인
 */
async function checkInfluencerEmail(userId, fromEmail, toEmail, influencers) {
  // 이메일 정규화
  const normalizedFrom = normalizeEmail(fromEmail);
  const normalizedTo = normalizeEmail(toEmail);

  console.log("🔍 이메일 매칭 확인:", {
    originalFrom: fromEmail,
    originalTo: toEmail,
    normalizedFrom: normalizedFrom,
    normalizedTo: normalizedTo,
  });

  // 인플루언서 목록에서 이메일 확인
  for (const influencer of influencers) {
    const influencerEmail = normalizeEmail(influencer.email);
    if (!influencerEmail) continue;

    console.log(
      `📧 인플루언서 이메일 비교: ${influencerEmail} vs from(${normalizedFrom}) | to(${normalizedTo})`
    );

    // from 또는 to에 인플루언서 이메일이 포함되어 있는지 확인
    if (
      normalizedFrom === influencerEmail ||
      normalizedTo === influencerEmail
    ) {
      console.log(
        `✅ 매칭 성공! 인플루언서: ${influencer.accountId} (${influencerEmail})`
      );
      return influencer;
    }
  }

  console.log("❌ 인플루언서 매칭 실패");
  return null;
}

/**
 * 메일 고유 ID 생성
 */
function generateUniqueId(email, provider) {
  const data = `${email.messageId || ""}-${email.from}-${email.subject}-${
    email.date || new Date()
  }-${provider}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * POST /api/emails/receive-filtered
 * 인플루언서 필터링을 적용한 메일 수신
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, options = {} } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 인플루언서 목록 조회
    const influencers = await prisma.influencer.findMany({
      where: {
        userId: parseInt(userId),
        email: { not: null },
      },
    });

    // 이메일 제공자별로 메일 가져오기
    const allEmails = [];
    const errors = [];

    // Gmail 메일 가져오기
    if (user.gmailSmtpUser && user.gmailSmtpPassword) {
      try {
        const gmailConfig = createGmailImapConfig(user);
        const gmailEmails = await fetchGmailEmailsViaImap(gmailConfig, {
          limit: options.limit || 50,
        });

        gmailEmails.forEach((email) => {
          email.provider = "gmail";
          allEmails.push(email);
        });

        console.log(`Gmail에서 ${gmailEmails.length}개 메일 수신`);
      } catch (error) {
        console.error("Gmail 메일 수신 실패:", error);
        errors.push({
          provider: "gmail",
          error: error.message,
        });
      }
    }

    // 메일플러그 IMAP으로 메일 가져오기
    if (user.mailplugSmtpUser && user.mailplugSmtpPassword) {
      try {
        console.log("메일플러그 IMAP 메일 수신 시작...");
        const mailplugImapConfig = createMailplugImapConfig(user);
        const mailplugEmails = await fetchMailplugEmailsViaImap(
          mailplugImapConfig,
          {
            limit: options.limit || 50,
          }
        );

        mailplugEmails.forEach((email) => {
          email.provider = "mailplug";
          allEmails.push(email);
        });

        console.log(`메일플러그 IMAP에서 ${mailplugEmails.length}개 메일 수신`);
      } catch (error) {
        console.error("메일플러그 IMAP 메일 수신 실패:", error);
        errors.push({
          provider: "mailplug",
          error: error.message,
        });
      }
    }

    if (allEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No emails found",
        totalFetched: 0,
        saved: 0,
        filtered: 0,
        errors: errors.length > 0 ? errors : undefined,
      });
    }

    console.log(
      `🔄 1단계: 모든 메일(${allEmails.length}개) 인플루언서 필터링 시작...`
    );

    // 1단계: 모든 메일 필터링 (DB 저장 없이)
    const emailsToSave = [];
    const filteredEmails = [];
    const duplicates = [];

    for (const email of allEmails) {
      try {
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

        // 인플루언서 확인
        const matchedInfluencer = await checkInfluencerEmail(
          parseInt(userId),
          email.from,
          email.to,
          influencers
        );

        if (matchedInfluencer) {
          // 인플루언서 메일 - 저장 대상에 추가
          emailsToSave.push({
            email,
            uniqueId,
            matchedInfluencer,
            isInfluencer: true,
          });

          console.log(
            `✅ 인플루언서 메일 필터링: ${email.subject} (${matchedInfluencer.accountId})`
          );
        } else {
          // 필터링된 메일 (인플루언서가 아님)
          filteredEmails.push({
            from: email.from,
            subject: email.subject,
            provider: email.provider,
          });

          if (options.saveAll) {
            // saveAll 옵션이 있으면 인플루언서가 아닌 메일도 저장 대상에 추가
            emailsToSave.push({
              email,
              uniqueId,
              matchedInfluencer: null,
              isInfluencer: false,
            });
            console.log(`📧 일반 메일 필터링: ${email.subject}`);
          } else {
            console.log(`⏭️ 필터링됨: ${email.subject} (인플루언서 아님)`);
          }
        }
      } catch (filterError) {
        console.error(`메일 필터링 실패: ${email.subject}`, filterError);
        errors.push({
          email: email.subject,
          error: filterError.message,
        });
      }
    }

    console.log(
      `🎯 1단계 완료 - 저장 대상: ${emailsToSave.length}개, 필터링: ${filteredEmails.length}개, 중복: ${duplicates.length}개`
    );

    // 2단계: 필터링 완료 후 데이터베이스 일괄 저장
    console.log(
      `🔄 2단계: 데이터베이스 저장 시작 (${emailsToSave.length}개)...`
    );
    const savedEmails = [];

    for (const {
      email,
      uniqueId,
      matchedInfluencer,
      isInfluencer,
    } of emailsToSave) {
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
            attachments:
              email.attachments?.length > 0 ? email.attachments : null,
            headers: email.headers ? Object.fromEntries(email.headers) : null,
            originalDate: email.date,
            receivedAt: new Date(),
            provider: email.provider,
            influencerId: matchedInfluencer ? matchedInfluencer.id : null,
            isInfluencer: isInfluencer,
          },
        });

        const savedEmailInfo = {
          id: savedEmail.id,
          from: savedEmail.from,
          subject: savedEmail.subject,
          provider: savedEmail.provider,
        };

        if (matchedInfluencer) {
          savedEmailInfo.influencer = {
            id: matchedInfluencer.id,
            accountId: matchedInfluencer.accountId,
            email: matchedInfluencer.email,
          };
        }

        savedEmails.push(savedEmailInfo);

        console.log(
          `💾 DB 저장 완료: ${email.subject} ${
            isInfluencer ? `(${matchedInfluencer.accountId})` : "(일반)"
          }`
        );
      } catch (saveError) {
        console.error(`DB 저장 실패: ${email.subject}`, saveError);
        errors.push({
          email: email.subject,
          error: saveError.message,
        });
      }
    }

    console.log(`✅ 2단계 완료 - 저장됨: ${savedEmails.length}개`);

    return NextResponse.json({
      success: true,
      message: `Filtered email reception completed`,
      stats: {
        totalFetched: allEmails.length,
        saved: savedEmails.length,
        filtered: filteredEmails.length,
        duplicates: duplicates.length,
        influencerCount: influencers.length,
      },
      savedEmails: savedEmails,
      filteredPreview: filteredEmails.slice(0, 5), // 필터링된 메일 미리보기 (처음 5개만)
      duplicatesPreview: duplicates.slice(0, 5), // 중복 메일 미리보기 (처음 5개만)
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error receiving filtered emails:", error);

    return NextResponse.json(
      {
        error: "Failed to receive filtered emails",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/emails/receive-filtered
 * 필터링된 메일 수신 상태 확인
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        email: true,
        gmailSmtpUser: true,
        mailplugSmtpUser: true,
        emailProvider: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 인플루언서 통계
    const totalInfluencers = await prisma.influencer.count({
      where: { userId: parseInt(userId) },
    });

    const influencersWithEmail = await prisma.influencer.count({
      where: {
        userId: parseInt(userId),
        email: { not: null },
      },
    });

    // 인플루언서 메일 통계
    const influencerEmails = await prisma.emailReceived.count({
      where: {
        userId: parseInt(userId),
        isInfluencer: true,
      },
    });

    const totalEmails = await prisma.emailReceived.count({
      where: { userId: parseInt(userId) },
    });

    const recentInfluencerEmails = await prisma.emailReceived.count({
      where: {
        userId: parseInt(userId),
        isInfluencer: true,
        receivedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 최근 24시간
        },
      },
    });

    // 플랫폼별 통계
    const gmailEmails = await prisma.emailReceived.count({
      where: {
        userId: parseInt(userId),
        provider: "gmail",
      },
    });

    const mailplugEmails = await prisma.emailReceived.count({
      where: {
        userId: parseInt(userId),
        provider: "mailplug",
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        emailProvider: user.emailProvider,
      },
      providers: {
        gmail: {
          configured: !!user.gmailSmtpUser,
          email: user.gmailSmtpUser,
        },
        mailplug: {
          configured: !!user.mailplugSmtpUser,
          email: user.mailplugSmtpUser,
        },
      },
      influencers: {
        total: totalInfluencers,
        withEmail: influencersWithEmail,
        withoutEmail: totalInfluencers - influencersWithEmail,
      },
      statistics: {
        totalEmails: totalEmails,
        influencerEmails: influencerEmails,
        nonInfluencerEmails: totalEmails - influencerEmails,
        recentInfluencerEmails: recentInfluencerEmails,
        byProvider: {
          gmail: gmailEmails,
          mailplug: mailplugEmails,
        },
      },
    });
  } catch (error) {
    console.error("Error getting filtered email status:", error);

    return NextResponse.json(
      {
        error: "Failed to get filtered email status",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
