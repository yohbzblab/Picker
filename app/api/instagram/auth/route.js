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

    // Instagram Business Login URL 생성 (정확한 엔드포인트)
    const scope =
      "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_comments,instagram_business_manage_messages,instagram_business_manage_insights";
    const state = Buffer.from(JSON.stringify({ userId })).toString("base64");
    console.log(process.env.INSTAGRAM_APP_ID);
    // Instagram Business Login 공식 엔드포인트
    const authUrl = new URL("https://www.instagram.com/oauth/authorize");
    authUrl.searchParams.append("client_id", process.env.INSTAGRAM_APP_ID);
    authUrl.searchParams.append(
      "redirect_uri",
      process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI
    );
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("state", state);
    console.log(authUrl.toString());

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error("Error initiating Instagram auth:", error);
    return NextResponse.json(
      { error: "Failed to initiate Instagram authentication" },
      { status: 500 }
    );
  }
}
