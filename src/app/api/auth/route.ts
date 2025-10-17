import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/db/data-source";
import { User } from "@/db/entities/User";
import * as bcrypt from "bcrypt";
import { SignJWT } from "jose";

/**
 * 认证接口 - 处理管理员登录
 * 使用Credentials Provider验证用户名密码
 * 成功后返回JWT token
 */
export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    // 验证用户名和密码
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { username } });
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    
    // 生成JWT token
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "your-secret-key");
    const token = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret);
    
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}