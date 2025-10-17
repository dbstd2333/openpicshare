import { NextResponse } from "next/server";
import { checkDatabaseHealth, reinitializeDatabase } from "@/db/health";

/**
 * 数据库健康检查API
 * GET: 检查数据库连接状态
 * POST: 尝试重新初始化数据库连接
 */
export async function GET() {
  try {
    const health = await checkDatabaseHealth();
    return NextResponse.json(health);
  } catch (error) {
    console.error("健康检查API错误:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "健康检查API异常",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await reinitializeDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error("重新初始化数据库API错误:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "重新初始化数据库API异常",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}