import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";

// 密钥，实际项目中应该从环境变量获取
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * 中间件：保护需要认证的路由
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 如果是访问 admin 路由，需要验证身份
  if (pathname.startsWith("/admin")) {
    // 获取 token - 尝试多种方式
    let token = request.cookies.get("auth-token")?.value;
    
    // 如果从 cookies 获取不到，尝试从请求头获取
    if (!token) {
      token = request.headers.get("authorization")?.replace("Bearer ", "");
    }
    
    // 如果还是获取不到，尝试从 cookie 字符串中解析
    if (!token && request.headers.get("cookie")) {
      const cookies = request.headers.get("cookie")?.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      token = cookies?.["auth-token"];
    }
    
    // 添加调试日志
    console.log("Middleware: Token found:", !!token);

    // 如果没有 token，重定向到登录页面
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // 验证 token
      console.log("JWT_SECRET:", JWT_SECRET);
      console.log("Token:", token?.substring(0, 20) + "...");
      verify(token, JWT_SECRET);
      console.log("Token verification successful");
    } catch (error) {
      // token 无效，重定向到登录页面
      console.log("Token verification failed:", error);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
  runtime: "nodejs",
};
