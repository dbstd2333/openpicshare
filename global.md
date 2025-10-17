# 📸 MVP 自部署电子相册系统 - Next.js 一体化版（TypeORM）

## 🧱 技术栈概览

-   **框架**：Next.js 15（App Router + Server Actions）
-   **UI 框架**：Ant Design 5 + Tailwind CSS 4
-   **ORM**：TypeORM
-   **数据库**：PostgreSQL
-   **数据库 URL**：`postgresql://pic:mayGYZfTcZMxJDMf@47.108.148.124:5432/pic`
-   **认证机制**：NextAuth.js（JWT 模式）
-   **部署方式**：Next.js 一体化（前后端统一）
-   **包管理**：pnpm

---

## 🏗️ 项目结构

```
photo-album/
├── app/
│   ├── page.tsx               # 首页：相册列表
│   ├── album/[id]/page.tsx    # 相册页：瀑布流
│   ├── admin/page.tsx         # 管理页：登录 / 上传 / 删除
│   ├── api/
│   │   ├── auth/route.ts      # 登录与 JWT 生成
│   │   ├── albums/route.ts    # 相册 CRUD
│   │   └── photos/route.ts    # 上传 / 删除 / 列表
├── components/
│   ├── AlbumCard.tsx
│   ├── ImageGrid.tsx
│   ├── UploadPanel.tsx
├── db/
│   ├── data-source.ts         # TypeORM 数据源配置
│   ├── entities/
│   │   ├── User.ts
│   │   ├── Album.ts
│   │   └── Photo.ts
├── lib/
│   ├── auth.ts                # NextAuth 配置
│   ├── utils.ts
├── public/uploads/            # 图片存储路径
├── tailwind.config.ts
└── next.config.mjs
```

---

## 💾 数据模型（`db/entities/*.ts`）

### `User.ts`

```ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    username: string

    @Column()
    passwordHash: string

    @CreateDateColumn()
    createdAt: Date
}
```

### `Album.ts`

```ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm"
import { Photo } from "./Photo"

@Entity()
export class Album {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @CreateDateColumn()
    createdAt: Date

    @OneToMany(() => Photo, (photo) => photo.album)
    photos: Photo[]
}
```

### `Photo.ts`

```ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm"
import { Album } from "./Album"

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    albumId: number

    @Column()
    url: string

    @CreateDateColumn()
    createdAt: Date

    @ManyToOne(() => Album, (album) => album.photos, { onDelete: "CASCADE" })
    album: Album
}
```

---

## ⚙️ TypeORM 数据源配置 (`db/data-source.ts`)

```ts
import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entities/User"
import { Album } from "./entities/Album"
import { Photo } from "./entities/Photo"

export const AppDataSource = new DataSource({
    type: "postgres",
    url: "postgresql://pic:mayGYZfTcZMxJDMf@47.108.148.124:5432/pic",
    synchronize: true,
    logging: false,
    entities: [User, Album, Photo],
})
```

---

## 🧩 API 接口示例

### `/api/albums/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server"
import { AppDataSource } from "@/db/data-source"
import { Album } from "@/db/entities/Album"

export async function GET() {
    const repo = AppDataSource.getRepository(Album)
    const albums = await repo.find({ relations: ["photos"] })
    return NextResponse.json(albums)
}

export async function POST(req: NextRequest) {
    const data = await req.json()
    const repo = AppDataSource.getRepository(Album)
    const album = repo.create({ name: data.name })
    await repo.save(album)
    return NextResponse.json(album)
}
```

---

## 🔐 权限与认证

-   使用 **NextAuth.js (Credentials Provider)** 登录。
-   登录后生成 JWT，前端存储于 localStorage。
-   上传、删除接口在服务端校验 JWT。

---

## 🖼️ 上传与压缩逻辑

-   前端使用 `browser-image-compression` 压缩。
-   多文件选择后，通过 `fetch('/api/photos', { method: 'POST', body: formData })` 上传。
-   服务端将文件保存至 `public/uploads/`，数据库保存相对路径。

---

## 🚀 部署与启动

### 环境变量 `.env.local`

```bash
DATABASE_URL="postgresql://pic:mayGYZfTcZMxJDMf@47.108.148.124:5432/pic"
NEXTAUTH_SECRET="生成一个随机字符串"
```

### 初始化

```bash
pnpm install
pnpm dev
```

### 构建部署

```bash
pnpm build
pnpm start
```

---

## ✅ 功能清单

| 模块     | 功能                       |
| -------- | -------------------------- |
| 首页     | 相册卡片展示               |
| 相册页   | 瀑布流预览                 |
| 管理页   | 登录、相册管理、上传、删除 |
| 上传压缩 | 客户端压缩 JPEG/PNG        |
| 权限控制 | JWT 登录验证               |
| 数据存储 | TypeORM + PostgreSQL       |

---

## 🧭 附加建议

-   可后续替换文件存储为 S3 / 阿里云 OSS。
-   图片 URL 建议使用 `/uploads/${filename}` 相对路径。
-   若访问量大，可添加 CDN 层缓存。
