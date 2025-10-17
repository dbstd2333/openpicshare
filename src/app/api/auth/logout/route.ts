import { NextRequest, NextResponse } from "next/server";

/**
 * 登出 API
 * POST: 清除认证 cookie
 */
export async function POST(req: NextRequest) {
  try {
    // 创建响应并清除认证 cookie
    const response = NextResponse.json({ message: "登出成功" });
    
    // 清除 cookie
    response.cookies.set("auth-token", "", {
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "登出失败，请重试" },
      { status: 500 }
    );
  }
}