import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { setAuthCookie } from "@/lib/auth-utils";

// 密钥，实际项目中应该从环境变量获取
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// 默认管理员账号，实际项目中应该从环境变量或数据库获取
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

/**
 * 登录 API
 * POST: 验证用户名密码并返回 JWT token
 */
export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // 验证用户名和密码
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    // 生成 JWT token
    const token = sign(
      { username, role: "admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 设置 cookie
    const cookieValue = setAuthCookie(token);

    const response = NextResponse.json({
      message: "登录成功",
      user: { username, role: "admin" }
    });

    response.headers.set("Set-Cookie", cookieValue);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "登录失败，请重试" },
      { status: 500 }
    );
  }
}