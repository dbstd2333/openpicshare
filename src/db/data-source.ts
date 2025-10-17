import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Album } from "./entities/Album";
import { Photo } from "./entities/Photo";

/**
 * 根据环境变量获取数据库URL
 * 开发环境使用47.108.148.124，生产环境使用172.19.12.137
 */
function getDatabaseUrl(): string {
  const isProduction = Deno.env.has("DENO_ENV") === "production";
  const host = isProduction ? "172.19.12.137" : "47.108.148.124";
  return `postgresql://pic:mayGYZfTcZMxJDMf@${host}:5432/pic`;
}

/**
 * TypeORM数据源配置
 * 适配Deno运行时环境
 */
export const AppDataSource = new DataSource({
  type: "postgres",
  url: getDatabaseUrl(),
  synchronize: true,
  logging: false,
  entities: [User, Album, Photo],
});
