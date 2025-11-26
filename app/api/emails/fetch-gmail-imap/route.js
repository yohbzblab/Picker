import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";
import Imap from "imap";
import { simpleParser } from "mailparser";
import {
  extractEmailAddresses,
  formatEmailForStorage,
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
 * Gmail IMAP으로 메일 가져오기
 */
function fetchGmailEmailsViaImap(config, options = {}) {
  return new Promise((resolve, reject) => {
    const imap = new Imap(config);
    const emails = [];
    let error = null;
    let isResolved = false;

    // 전체 작업 타임아웃 (30초로 단축)
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

      console.log(`✅ Gmail 메일 가져오기 완료 - 총 ${emails.length}개`);
      // 최신 메일부터 정렬하여 반환
      emails.sort((a, b) => new Date(b.date) - new Date(a.date));
      resolve(emails);
    }

    imap.once("ready", function () {
      console.log("✅ Gmail IMAP 연결 성공");

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

        console.log(
          `📬 Gmail INBOX 열기 성공 - 총 메일: ${box.messages.total}개`
        );

        if (box.messages.total === 0) {
          console.log("📭 Gmail 받은 메일이 없습니다");
          finishWithResults();
          return;
        }

        // 모든 메일 가져오기 (limit 제거)
        const fetchRange = "1:*";

        console.log(
          `📨 Gmail 모든 메일 가져오는 중... (총 ${box.messages.total}개)`
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

              // 모든 메일 데이터 수집 완료시 한번에 파싱
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

                const processedEmail = {
                  id: `gmail-${seqno}-${Date.now()}`,
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
                  isGmailEmail: true,
                  contentLength: parsed.text ? parsed.text.length : 0,
                  provider: "gmail",
                };

                return processedEmail;
              })
              .catch((parseErr) => {
                return {
                  id: `gmail-${seqno}-${Date.now()}`,
                  messageId: `unknown-${seqno}`,
                  from: "발신자 불명",
                  subject: "파싱 실패한 메일",
                  date: new Date(),
                  textContent: "메일 내용을 읽을 수 없습니다.",
                  preview: "메일 파싱에 실패했습니다.",
                  isRead: false,
                  receivedAt: new Date().toISOString(),
                  isNewEmail: true,
                  isGmailEmail: true,
                  hasAttachments: false,
                  error: parseErr.message,
                  provider: "gmail",
                };
              });

            promises.push(promise);
          });

          // 모든 파싱이 완료되면 즉시 결과 반환
          Promise.allSettled(promises).then((results) => {
            results.forEach((result) => {
              if (result.status === "fulfilled") {
                emails.push(result.value);
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
 * POST /api/emails/fetch-gmail-imap
 * Gmail IMAP으로 메일을 가져와서 바로 반환 (DB 저장 안 함)
 */
export async function POST(request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const body = await request.json();
    const { userId, options = {} } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.gmailSmtpUser || !user.gmailSmtpPassword) {
      return NextResponse.json(
        {
          error: "Gmail credentials not configured",
        },
        { status: 400 }
      );
    }

    console.log(`사용자 ${userId}의 Gmail IMAP 메일 가져오기 시작...`);

    const imapConfig = createGmailImapConfig(user);
    const fetchOptions = {};

    const emails = await fetchGmailEmailsViaImap(imapConfig, fetchOptions);

    if (emails.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No Gmail emails found",
        count: 0,
        method: "Gmail IMAP",
        server: "imap.gmail.com:993",
        emails: [],
      });
    }

    console.log(`📧 Gmail IMAP 메일 가져오기 성공: ${emails.length}개`);

    return NextResponse.json({
      success: true,
      message: `${emails.length} emails fetched successfully via Gmail IMAP`,
      count: emails.length,
      method: "Gmail IMAP",
      server: "imap.gmail.com:993",
      emails: emails,
    });
  } catch (error) {
    console.error("Gmail IMAP 메일 가져오기 오류:", error);

    if (error.name === "AbortError" || error.message.includes("timeout")) {
      return NextResponse.json(
        {
          error: "Gmail IMAP connection timeout",
          details: "The operation took too long. Please try again.",
          method: "Gmail IMAP",
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch emails via Gmail IMAP",
        details: error.message,
        method: "Gmail IMAP",
      },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * GET /api/emails/fetch-gmail-imap
 * Gmail IMAP 연결 테스트만 수행
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

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user || !user.gmailSmtpUser || !user.gmailSmtpPassword) {
      return NextResponse.json(
        {
          error: "User not found or Gmail credentials not configured",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Gmail IMAP fetch service is available",
      server: "imap.gmail.com:993",
      method: "Gmail IMAP",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to check Gmail IMAP fetch status",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
