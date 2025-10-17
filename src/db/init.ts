import { AppDataSource } from "@/db/data-source";
import { checkDatabaseHealth, reinitializeDatabase } from "@/db/health";

/**
 * 确保数据源已初始化
 * 添加重试机制和更好的错误处理
 */
export async function ensureDataSourceInitialized() {
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log("数据源初始化成功");
    } catch (error) {
      console.error("数据源初始化失败:", error);
      // 如果初始化失败，尝试重新创建数据源
      try {
        const result = await reinitializeDatabase();
        if (result.success) {
          console.log("数据源重新初始化成功");
        } else {
          throw new Error(result.message);
        }
      } catch (retryError) {
        console.error("数据源重新初始化失败:", retryError);
        throw retryError;
      }
    }
  } else {
    // 如果已初始化，检查连接健康状态
    const health = await checkDatabaseHealth();
    if (health.status !== "healthy") {
      console.warn("数据库连接不健康:", health.message);
      try {
        const result = await reinitializeDatabase();
        if (result.success) {
          console.log("数据源重新初始化成功");
        } else {
          throw new Error(result.message);
        }
      } catch (retryError) {
        console.error("数据源重新初始化失败:", retryError);
        throw retryError;
      }
    }
  }
}