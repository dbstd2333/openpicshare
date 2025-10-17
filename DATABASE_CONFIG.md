# 数据库配置说明

## 环境配置

本项目根据环境变量 `DENO_ENV` 自动选择数据库连接地址：

- **开发环境** (`DENO_ENV=development`): 使用 `47.108.148.124`
- **生产环境** (`DENO_ENV=production`): 使用 `172.19.12.137`

## 使用方法

### 开发环境

1. 复制 `.env.example` 为 `.env`
2. 确保 `.env` 文件中包含：
   ```
   DENO_ENV=development
   ```
3. 启动应用，将自动连接到开发数据库

### 生产环境

1. 设置环境变量：
   ```
   export DENO_ENV=production
   ```
2. 启动应用，将自动连接到生产数据库

## 注意事项

- 数据库用户名和密码已硬编码在配置文件中
- 端口号固定为 5432
- 数据库名固定为 pic
- 如需修改其他连接参数，请编辑 `src/db/data-source.ts` 文件中的 `getDatabaseUrl()` 函数