import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import { extractProviderConfig } from "../../../../lib/emailProviders";
import net from "net";
import tls from "tls";


/**
 * GET /api/emails/simple-email-info
 * 간단 테스트와 동일한 구조로 실제 메일 헤더 정보 가져오기
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit")) || 10;

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

    // 메일플러그 설정 확인
    if (!user.mailplugSmtpUser || !user.mailplugSmtpPassword) {
      return NextResponse.json(
        {
          error: "Mailplug credentials not configured",
        },
        { status: 400 }
      );
    }

    const mailplugConfig = extractProviderConfig(user, "mailplug");

    console.log(`📧 간단한 방식으로 ${limit}개 메일 정보 분석...`);

    // 실제 메일 헤더 가져오기 (간단 테스트와 동일한 연결 구조)
    const result = await getSimpleEmailInfo(mailplugConfig, limit);

    return NextResponse.json({
      success: true,
      message: `${result.emails.length}개의 메일 정보를 분석했습니다`,
      config: {
        email: mailplugConfig.smtpUser,
        host: "pop3.mailplug.co.kr",
        port: 995,
        method: "header_fetch_with_pop3",
      },
      statistics: {
        total_emails: result.emailCount,
        analyzed_emails: result.emails.length,
        spam_emails: result.emails.filter((e) => e.isSpam).length,
        normal_emails: result.emails.filter((e) => !e.isSpam).length,
      },
      emails: result.emails,
    });
  } catch (error) {
    console.error("간단한 메일 정보 가져오기 에러:", error);

    return NextResponse.json(
      {
        error: "간단한 메일 정보 가져오기 실패",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// 간단 테스트와 동일한 연결 방식 + 실제 메일 헤더 가져오기
async function getSimpleEmailInfo(config, limit) {
  const { smtpUser: email, smtpPassword: password } = config;

  return new Promise((resolve, reject) => {
    let socket = null;
    let isResolved = false;
    let currentStep = "initial";
    let emailsToFetch = [];
    let fetchedEmails = [];
    let currentFetchIndex = 0;

    const result = {
      steps: [],
      emailCount: 0,
      totalSize: 0,
      emails: [],
      raw_responses: [],
      final_status: "unknown",
    };

    try {
      result.steps.push({
        step: 1,
        action: "Creating direct socket connection",
        status: "attempting",
        timestamp: new Date().toISOString(),
      });

      console.log("🔌 POP3 서버 연결 시도...");

      // 간단 테스트와 정확히 동일한 연결 방식
      socket = net.createConnection({
        host: "pop3.mailplug.co.kr",
        port: 995,
        timeout: 10000,
      });

      socket.on("connect", () => {
        console.log("✅ TCP 소켓 연결 성공");
        result.steps.push({
          step: 2,
          action: "Connected to POP3 server",
          status: "success",
          timestamp: new Date().toISOString(),
        });

        // TLS 업그레이드
        console.log("🔒 TLS 연결 시도...");
        const tlsSocket = tls.connect({
          socket: socket,
          host: "pop3.mailplug.co.kr",
          port: 995,
          rejectUnauthorized: false,
          checkServerIdentity: () => undefined,
          secureProtocol: "TLSv1_2_method",
        });

        tlsSocket.on("secureConnect", () => {
          console.log("🔐 TLS 연결 성공");
          result.steps.push({
            step: 3,
            action: "TLS connection established",
            status: "success",
            timestamp: new Date().toISOString(),
          });

          let responseBuffer = "";

          tlsSocket.on("data", (data) => {
            const response = data.toString();
            responseBuffer += response;
            console.log("📥 서버 응답:", response.trim());
            result.raw_responses.push({
              timestamp: new Date().toISOString(),
              data: response.trim(),
            });

            // 간단 테스트와 정확히 동일한 단계별 처리
            if (currentStep === "initial" && response.includes("+OK")) {
              currentStep = "connected";
              console.log("🚀 USER 명령 전송...");
              tlsSocket.write(`USER ${email}\r\n`);
            } else if (
              currentStep === "connected" &&
              response.includes("+OK")
            ) {
              currentStep = "user_sent";
              console.log("🔑 PASS 명령 전송...");
              tlsSocket.write(`PASS ${password}\r\n`);
            } else if (
              currentStep === "user_sent" &&
              response.includes("+OK")
            ) {
              currentStep = "logged_in";
              console.log("✅ 로그인 성공! STAT 명령 시도...");
              result.steps.push({
                step: 4,
                action: "Login successful",
                status: "success",
                timestamp: new Date().toISOString(),
              });
              tlsSocket.write("STAT\r\n");
            } else if (
              currentStep === "logged_in" &&
              response.includes("+OK")
            ) {
              currentStep = "stat_done";
              console.log("📊 STAT 명령 성공! 응답:", response.trim());

              // STAT 응답에서 메일 개수 추출
              const statMatch = response.match(/\+OK (\d+) (\d+)/);
              if (statMatch) {
                result.emailCount = parseInt(statMatch[1]);
                result.totalSize = parseInt(statMatch[2]);
                console.log(
                  `📬 ${result.emailCount}개 메일, 총 ${Math.round(
                    result.totalSize / 1024 / 1024
                  )}MB`
                );

                result.steps.push({
                  step: 5,
                  action: "STAT command successful",
                  status: "success",
                  data: {
                    emailCount: result.emailCount,
                    totalSizeBytes: result.totalSize,
                    totalSizeMB: Math.round(result.totalSize / 1024 / 1024),
                    response: response.trim(),
                  },
                  timestamp: new Date().toISOString(),
                });
              }

              // LIST 명령으로 메일 목록 가져오기
              console.log("📋 LIST 명령 시도...");
              tlsSocket.write("LIST\r\n");
            } else if (
              currentStep === "stat_done" &&
              (response.includes("+OK") || response.includes("-ERR"))
            ) {
              currentStep = "list_done";
              console.log(
                "📋 LIST 명령 결과:",
                response.trim().substring(0, 100)
              );

              if (response.includes("+OK") && result.emailCount > 0) {
                // LIST 성공 - 메일 목록 파싱
                console.log("✅ LIST 성공, 메일 인덱스 분석 중...");

                // 최대 limit개만 가져오기 (최신 메일부터)
                const maxEmails = Math.min(limit, result.emailCount);
                const startIndex = Math.max(
                  1,
                  result.emailCount - maxEmails + 1
                );

                for (
                  let i = result.emailCount;
                  i >= startIndex && emailsToFetch.length < maxEmails;
                  i--
                ) {
                  emailsToFetch.push(i);
                }

                console.log(
                  `📧 ${emailsToFetch.length}개 메일 헤더 가져오기 시작...`
                );

                result.steps.push({
                  step: 6,
                  action:
                    "LIST command successful, starting email header fetch",
                  status: "success",
                  data: {
                    totalEmails: result.emailCount,
                    emailsToFetch: emailsToFetch.length,
                    emailIndices: emailsToFetch.slice(0, 3),
                  },
                  timestamp: new Date().toISOString(),
                });

                // 첫 번째 메일 헤더와 일부 본문 가져오기 시작
                if (emailsToFetch.length > 0) {
                  currentStep = "fetching_emails";
                  const emailIndex = emailsToFetch[currentFetchIndex];
                  console.log(
                    `📧 메일 ${emailIndex} 헤더+미리보기 가져오기... (${
                      currentFetchIndex + 1
                    }/${emailsToFetch.length})`
                  );
                  tlsSocket.write(`TOP ${emailIndex} 20\r\n`);
                } else {
                  currentStep = "all_done";
                  console.log("👋 QUIT 명령 전송...");
                  tlsSocket.write("QUIT\r\n");
                  result.final_status = "completed";
                }
              } else {
                // LIST 실패 또는 메일 없음
                result.steps.push({
                  step: 6,
                  action: "LIST command result",
                  status: result.emailCount === 0 ? "success" : "error",
                  data: response.trim(),
                  timestamp: new Date().toISOString(),
                });

                console.log("👋 QUIT 명령 전송...");
                tlsSocket.write("QUIT\r\n");
                result.final_status = "completed";
              }
            } else if (
              currentStep === "fetching_emails" &&
              (response.includes("+OK") || response.includes("-ERR"))
            ) {
              console.log(
                `📬 메일 ${emailsToFetch[currentFetchIndex]} 헤더+미리보기 응답 수신`
              );

              if (response.includes("+OK")) {
                // 메일 헤더와 미리보기 파싱
                const emailData = parseEmailHeader(
                  response,
                  emailsToFetch[currentFetchIndex]
                );
                if (emailData) {
                  fetchedEmails.push(emailData);
                  console.log(
                    `✅ 메일 ${emailsToFetch[currentFetchIndex]} 파싱 성공: ${emailData.subject}`
                  );
                }
              } else {
                console.log(
                  `❌ 메일 ${emailsToFetch[currentFetchIndex]} 가져오기 실패`
                );
              }

              // 다음 메일로 이동
              currentFetchIndex++;

              if (currentFetchIndex < emailsToFetch.length) {
                const emailIndex = emailsToFetch[currentFetchIndex];
                console.log(
                  `📧 메일 ${emailIndex} 헤더+미리보기 가져오기... (${
                    currentFetchIndex + 1
                  }/${emailsToFetch.length})`
                );
                tlsSocket.write(`TOP ${emailIndex} 20\r\n`);
              } else {
                // 모든 메일 처리 완료
                result.emails = fetchedEmails;

                result.steps.push({
                  step: 7,
                  action: "All email headers fetched",
                  status: "success",
                  data: {
                    totalFetched: fetchedEmails.length,
                    emails: fetchedEmails
                      .slice(0, 3)
                      .map((e) => ({ subject: e.subject, from: e.from })),
                  },
                  timestamp: new Date().toISOString(),
                });

                console.log(
                  `✅ 전체 ${fetchedEmails.length}개 메일 전체 가져오기 완료`
                );
                console.log("👋 QUIT 명령 전송...");
                tlsSocket.write("QUIT\r\n");
                result.final_status = "completed";

                setTimeout(() => {
                  if (!isResolved) {
                    isResolved = true;
                    tlsSocket.end();
                    resolve(result);
                  }
                }, 1000);
              }
            } else if (response.includes("-ERR")) {
              console.error("❌ 서버 에러:", response.trim());
              result.steps.push({
                step: "error",
                action: "Server error",
                status: "error",
                error: response.trim(),
                timestamp: new Date().toISOString(),
              });
              result.final_status = "server_error";

              if (!isResolved) {
                isResolved = true;
                tlsSocket.end();
                resolve(result);
              }
            }
          });

          tlsSocket.on("error", (tlsErr) => {
            console.error("❌ TLS 에러:", tlsErr);
            if (!isResolved) {
              result.steps.push({
                step: "error",
                action: "TLS error",
                status: "error",
                error: tlsErr.toString(),
                timestamp: new Date().toISOString(),
              });
              result.final_status = "tls_error";
              isResolved = true;
              resolve(result);
            }
          });

          tlsSocket.on("end", () => {
            console.log("📤 TLS 연결 종료됨");
            if (!isResolved) {
              result.final_status = "connection_ended";
              isResolved = true;
              resolve(result);
            }
          });
        });

        tlsSocket.on("error", (tlsErr) => {
          console.error("❌ TLS 연결 실패:", tlsErr);
          if (!isResolved) {
            result.steps.push({
              step: 3,
              action: "TLS connection failed",
              status: "error",
              error: tlsErr.toString(),
              timestamp: new Date().toISOString(),
            });
            result.final_status = "tls_failed";
            isResolved = true;
            resolve(result);
          }
        });
      });

      socket.on("error", (err) => {
        console.error("❌ TCP 소켓 연결 실패:", err);
        if (!isResolved) {
          result.steps.push({
            step: 2,
            action: "TCP connection failed",
            status: "error",
            error: err.toString(),
            timestamp: new Date().toISOString(),
          });
          result.final_status = "tcp_failed";
          isResolved = true;
          resolve(result);
        }
      });

      socket.on("timeout", () => {
        console.error("⏰ TCP 소켓 연결 타임아웃");
        if (!isResolved) {
          result.steps.push({
            step: "timeout",
            action: "TCP connection timeout",
            status: "error",
            error: "Connection timeout after 10 seconds",
            timestamp: new Date().toISOString(),
          });
          result.final_status = "tcp_timeout";
          isResolved = true;
          resolve(result);
        }
      });

      // 전체 타임아웃 (메일 가져오기는 더 오래 걸릴 수 있음)
      setTimeout(() => {
        if (!isResolved) {
          console.error("⏰ 전체 테스트 타임아웃");
          result.steps.push({
            step: "timeout",
            action: "Overall test timeout",
            status: "error",
            error: "Test timed out after 60 seconds",
            timestamp: new Date().toISOString(),
          });
          result.final_status = "overall_timeout";
          isResolved = true;
          if (socket) {
            socket.destroy();
          }
          resolve(result);
        }
      }, 60000);
    } catch (error) {
      console.error("💀 직접 연결 테스트 예외:", error);
      if (!isResolved) {
        result.steps.push({
          step: "exception",
          action: "Unexpected error",
          status: "error",
          error: error.toString(),
          timestamp: new Date().toISOString(),
        });
        result.final_status = "exception";
        isResolved = true;
        resolve(result);
      }
    }
  });
}

function parseFullEmail(response, emailIndex) {
  try {
    // 메일이 너무 크면 처음 50KB만 처리 (성능 최적화)
    let processedResponse = response;
    if (response.length > 50000) {
      console.log(
        `📏 메일 ${emailIndex}이 너무 큼 (${Math.round(
          response.length / 1024
        )}KB), 처음 50KB만 처리`
      );
      processedResponse = response.substring(0, 50000);
    }

    const lines = processedResponse.split("\n");
    let inHeader = false;
    let subject = "";
    let from = "";
    let to = "";
    let date = "";
    let messageId = "";
    let content = "";
    let isHtml = false;
    let contentLineCount = 0;
    const maxContentLines = 500; // 본문 최대 500줄로 제한

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 헤더 시작 인식
      if (line.includes("+OK") && !inHeader) {
        inHeader = true;
        continue;
      }

      // 헤더 끝 인식
      if (line === "" && inHeader) {
        inHeader = false;
        continue;
      }

      // 메일 끝 인식
      if (line === ".") {
        break;
      }

      if (inHeader) {
        // Subject 추출 (대소문자 구분 없이)
        if (line.toLowerCase().startsWith("subject:")) {
          subject = line.substring(8).trim();
          console.log(`🔍 Subject 발견: "${subject.substring(0, 50)}..."`);

          // 다음 줄에 연속되는 제목이 있는지 확인
          while (
            i + 1 < lines.length &&
            (lines[i + 1].startsWith(" ") || lines[i + 1].startsWith("\t"))
          ) {
            i++;
            subject += " " + lines[i].trim();
          }

          // RFC2047 디코딩 (간단한 버전)
          if (subject.includes("=?") && subject.includes("?=")) {
            subject = decodeRFC2047(subject);
          }
        }

        // From 추출 (대소문자 구분 없이)
        if (line.toLowerCase().startsWith("from:")) {
          let fullFrom = line.substring(5).trim();
          console.log(`🔍 From 발견: "${fullFrom.substring(0, 50)}..."`);

          // 다음 줄에 연속되는 from이 있는지 확인
          while (
            i + 1 < lines.length &&
            (lines[i + 1].startsWith(" ") || lines[i + 1].startsWith("\t"))
          ) {
            i++;
            fullFrom += " " + lines[i].trim();
          }

          // 원본 From 정보 보존하되, 실제 이메일 주소도 추출
          from = fullFrom;

          // RFC2047 디코딩 적용
          if (from.includes("=?") && from.includes("?=")) {
            from = decodeRFC2047(from);
          }

          // 만약 이메일 주소만 원한다면 다음 코드 활용
          // const emailMatch = fullFrom.match(/<([^>]+)>/)
          // if (emailMatch) {
          //   from = emailMatch[1]
          // } else {
          //   const simpleEmailMatch = fullFrom.match(/\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b/)
          //   if (simpleEmailMatch) {
          //     from = simpleEmailMatch[0]
          //   }
          // }
        }

        // To 추출
        if (line.toLowerCase().startsWith("to:")) {
          to = line.substring(3).trim();
          console.log(`🔍 To 발견: "${to}"`);
        }

        // Date 추출
        if (line.toLowerCase().startsWith("date:")) {
          date = line.substring(5).trim();
          console.log(`🔍 Date 발견: "${date}"`);
        }

        // Message-ID 추출
        if (line.toLowerCase().startsWith("message-id:")) {
          messageId = line.substring(11).trim().replace(/[<>]/g, "");
          console.log(`🔍 Message-ID 발견: "${messageId.substring(0, 30)}..."`);
        }

        // Content-Type 확인 (HTML 여부)
        if (line.toLowerCase().startsWith("content-type:")) {
          if (
            line.toLowerCase().includes("text/html") ||
            line.toLowerCase().includes("multipart/alternative")
          ) {
            isHtml = true;
            console.log(`🔍 HTML 메일 감지`);
          }
        }
      } else {
        // 헤더 이후는 본문 내용 (제한적으로 처리)
        if (line !== "." && contentLineCount < maxContentLines) {
          content += line + "\n";
          contentLineCount++;
        } else if (contentLineCount >= maxContentLines) {
          // 너무 많은 줄이면 중단
          content += "\n... (내용이 너무 길어서 생략됨) ...\n";
          break;
        }
      }
    }

    // 스팸 감지 (간단한 버전)
    const isSpam =
      subject.toLowerCase().includes("spam") ||
      subject.includes("[스팸]") ||
      from.toLowerCase().includes("noreply") ||
      from.toLowerCase().includes("spam");

    // 파싱 결과 로깅
    console.log(`📋 메일 ${emailIndex} 파싱 결과:`);
    console.log(`  📧 Subject: "${subject || "없음"}"`);
    console.log(`  📤 From: "${from || "없음"}"`);
    console.log(`  📅 Date: "${date || "없음"}"`);
    console.log(`  📝 Content 길이: ${content.length}`);
    console.log(`  🌐 HTML: ${isHtml}`);
    console.log(`  🚫 스팸: ${isSpam}`);

    return {
      messageId: emailIndex,
      subject: subject || "(제목 없음)",
      from: from || "(발신자 없음)",
      to: to,
      date: date,
      originalMessageId: messageId,
      isSpam: isSpam,
      hasAttachments: content
        .toLowerCase()
        .includes("content-disposition: attachment"),
      preview: content
        ? extractTextPreview(content, isHtml).substring(0, 200)
        : subject,
      content: content.trim(),
      isHtml: isHtml,
      contentLength: content.length,
      size: "unknown",
    };
  } catch (error) {
    console.error(`메일 ${emailIndex} 전체 파싱 실패:`, error);
    return null;
  }
}

// TOP 명령어 응답을 위한 헤더 파싱 함수
function parseEmailHeader(response, emailIndex) {
  try {
    // TOP 응답은 일반적으로 헤더 + 일부 본문으로 구성됨
    const lines = response.split("\n");
    let inHeader = false;
    let subject = "";
    let from = "";
    let to = "";
    let date = "";
    let messageId = "";
    let content = "";
    let isHtml = false;
    let contentLineCount = 0;
    const maxContentLines = 50; // TOP으로 가져온 본문은 적게

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 헤더 시작 인식
      if (line.includes("+OK") && !inHeader) {
        inHeader = true;
        console.log(`✅ 헤더 시작 인식 (라인 ${i})`);
        continue;
      }

      // 헤더 끝 인식
      if (line === "" && inHeader) {
        inHeader = false;
        console.log(`✅ 헤더 끝 인식 (라인 ${i}), 본문 시작`);
        continue;
      }

      // 메일 끝 인식
      if (line === ".") {
        console.log(`✅ 메일 끝 인식 (라인 ${i})`);
        break;
      }

      if (inHeader) {
        // Subject 추출 (대소문자 구분 없이)
        if (line.toLowerCase().startsWith("subject:")) {
          subject = line.substring(8).trim();
          console.log(`🔍 Subject 발견: "${subject.substring(0, 50)}..."`);

          // 다음 줄에 연속되는 제목이 있는지 확인
          while (
            i + 1 < lines.length &&
            (lines[i + 1].startsWith(" ") || lines[i + 1].startsWith("\t"))
          ) {
            i++;
            subject += " " + lines[i].trim();
          }

          // RFC2047 디코딩 (간단한 버전)
          if (subject.includes("=?") && subject.includes("?=")) {
            subject = decodeRFC2047(subject);
          }
        }

        // From 추출 (대소문자 구분 없이)
        if (line.toLowerCase().startsWith("from:")) {
          let fullFrom = line.substring(5).trim();
          console.log(`🔍 From 발견: "${fullFrom.substring(0, 50)}..."`);

          // 다음 줄에 연속되는 from이 있는지 확인
          while (
            i + 1 < lines.length &&
            (lines[i + 1].startsWith(" ") || lines[i + 1].startsWith("\t"))
          ) {
            i++;
            fullFrom += " " + lines[i].trim();
          }

          // 원본 From 정보 보존
          from = fullFrom;

          // RFC2047 디코딩 적용
          if (from.includes("=?") && from.includes("?=")) {
            from = decodeRFC2047(from);
          }
        }

        // To 추출
        if (line.toLowerCase().startsWith("to:")) {
          to = line.substring(3).trim();
          console.log(`🔍 To 발견: "${to}"`);
        }

        // Date 추출
        if (line.toLowerCase().startsWith("date:")) {
          date = line.substring(5).trim();
          console.log(`🔍 Date 발견: "${date}"`);
        }

        // Message-ID 추출
        if (line.toLowerCase().startsWith("message-id:")) {
          messageId = line.substring(11).trim().replace(/[<>]/g, "");
          console.log(`🔍 Message-ID 발견: "${messageId.substring(0, 30)}..."`);
        }

        // Content-Type 확인 (HTML 여부)
        if (line.toLowerCase().startsWith("content-type:")) {
          if (
            line.toLowerCase().includes("text/html") ||
            line.toLowerCase().includes("multipart/alternative")
          ) {
            isHtml = true;
            console.log(`🔍 HTML 메일 감지`);
          }
        }
      } else {
        // 헤더 이후는 본문 내용 (제한적으로 처리)
        if (line !== "." && contentLineCount < maxContentLines) {
          content += line + "\n";
          contentLineCount++;
        } else if (contentLineCount >= maxContentLines) {
          // 너무 많은 줄이면 중단
          content += "\n... (미리보기 생략) ...\n";
          break;
        }
      }
    }

    // 스팸 감지 (간단한 버전)
    const isSpam =
      subject.toLowerCase().includes("spam") ||
      subject.includes("[스팸]") ||
      from.toLowerCase().includes("noreply") ||
      from.toLowerCase().includes("spam");

    // 파싱 결과 로깅
    console.log(`📋 메일 ${emailIndex} 파싱 결과:`);
    console.log(`  📧 Subject: "${subject || "없음"}"`);
    console.log(`  📤 From: "${from || "없음"}"`);
    console.log(`  📅 Date: "${date || "없음"}"`);
    console.log(`  📝 Content 길이: ${content.length}`);
    console.log(`  🌐 HTML: ${isHtml}`);
    console.log(`  🚫 스팸: ${isSpam}`);

    return {
      messageId: emailIndex,
      subject: subject || "(제목 없음)",
      from: from || "(발신자 없음)",
      to: to,
      date: date,
      originalMessageId: messageId,
      isSpam: isSpam,
      hasAttachments: content
        .toLowerCase()
        .includes("content-disposition: attachment"),
      preview: content
        ? extractTextPreview(content, isHtml).substring(0, 200)
        : subject,
      content: content.trim(),
      isHtml: isHtml,
      contentLength: content.length,
      size: "unknown",
    };
  } catch (error) {
    console.error(`메일 ${emailIndex} 헤더 파싱 실패:`, error);
    return null;
  }
}

// 메일 본문에서 텍스트 미리보기 추출
function extractTextPreview(content, isHtml) {
  try {
    if (!content) return "";

    let text = content;

    if (isHtml) {
      // HTML 태그 제거 (간단한 버전)
      text = text.replace(/<[^>]*>/g, " ");
      text = text.replace(/&nbsp;/g, " ");
      text = text.replace(/&lt;/g, "<");
      text = text.replace(/&gt;/g, ">");
      text = text.replace(/&amp;/g, "&");
    }

    // 공백 정리
    text = text.replace(/\s+/g, " ").trim();

    // 이메일 서명 등 제거
    const lines = text.split("\n");
    const contentLines = lines.filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed &&
        !trimmed.startsWith("--") &&
        !trimmed.includes("이 메일을 더 이상 받고 싶지 않으시면") &&
        !trimmed.includes("unsubscribe")
      );
    });

    return contentLines.join(" ").substring(0, 300);
  } catch (error) {
    return content.substring(0, 100);
  }
}

// RFC2047 디코딩 기본 버전
function decodeRFC2047(str) {
  try {
    // =?charset?encoding?text?= 형식 처리
    return str.replace(
      /=\?([^?]+)\?([BQ])\?([^?]+)\?=/gi,
      (match, charset, encoding, text) => {
        try {
          if (encoding.toUpperCase() === "B") {
            // Base64 디코딩
            const decoded = Buffer.from(text, "base64").toString("utf8");
            return decoded;
          } else if (encoding.toUpperCase() === "Q") {
            // Quoted-printable 디코딩 (간단한 버전)
            const decoded = text
              .replace(/_/g, " ")
              .replace(/=([0-9A-F]{2})/gi, (_, hex) => {
                return String.fromCharCode(parseInt(hex, 16));
              });
            return decoded;
          }
          return text;
        } catch (e) {
          return text;
        }
      }
    );
  } catch (error) {
    return str;
  }
}
