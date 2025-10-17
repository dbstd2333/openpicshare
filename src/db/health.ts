import { AppDataSource } from "./data-source";

/**
 * 检查数据库连接状态
 */
export async function checkDatabaseHealth() {
  try {
    if (!AppDataSource.isInitialized) {
      return { status: "not_initialized", message: "数据库未初始化" };
    }
    
    // 执行简单查询检查连接
    await AppDataSource.query("SELECT 1");
    return { status: "healthy", message: "数据库连接正常" };
  } catch (error) {
    console.error("数据库健康检查失败:", error);
    return { 
      status: "unhealthy", 
      message: "数据库连接异常",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * 重新初始化数据库连接
 */
export async function reinitializeDatabase() {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    await AppDataSource.initialize();
    return { success: true, message: "数据库重新初始化成功" };
  } catch (error) {
    console.error("数据库重新初始化失败:", error);
    return { 
      success: false, 
      message: "数据库重新初始化失败",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}