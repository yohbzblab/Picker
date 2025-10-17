import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Facebook Login URL 생성 (Instagram Graph API를 위한 권한 포함)
    const scope = [
      "email",
      "public_profile",
      "instagram_basic",
      "instagram_content_publish",
      "instagram_manage_comments",
      "instagram_manage_insights",
      "instagram_manage_messages",
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_metadata",
      "pages_messaging",
      "business_management"
    ].join(",");

    const state = Buffer.from(JSON.stringify({ userId })).toString("base64");

    // Facebook OAuth 엔드포인트 (v18.0 사용)
    const authUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth");
    authUrl.searchParams.append("client_id", process.env.FACEBOOK_APP_ID);
    authUrl.searchParams.append(
      "redirect_uri",
      process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI
    );
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("auth_type", "rerequest");
    // 디스플레이 모드를 popup으로 설정하여 쿠키 동의 페이지 우회 시도
    authUrl.searchParams.append("display", "popup");

    console.log("Facebook auth URL:", authUrl.toString());

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error("Error initiating Facebook auth:", error);
    return NextResponse.json(
      { error: "Failed to initiate Facebook authentication" },
      { status: 500 }
    );
  }
}