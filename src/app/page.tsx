import { AlbumCard } from "@/components/AlbumCard";
import { ConfigProvider, theme, Button, Empty } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Link from "next/link";
import "@ant-design/v5-patch-for-react-19";

export const dynamic = 'force-dynamic';

/**
 * 首页组件
 * 显示相册列表，支持移动端优化
 */
export default async function Home() {
  // 尝试获取相册列表，如果数据库不可用则显示空列表
  let serializedAlbums: Array<{
    id: number;
    name: string;
    createdAt: string;
    photos: Array<{
      id: number;
      url: string;
    }>;
  }> = [];
  
  try {
    // 动态导入数据库相关模块，避免构建时加载
    const { AppDataSource } = await import("@/db/data-source");
    const { Album } = await import("@/db/entities/Album");
    
    // 初始化数据库连接
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // 获取相册列表
    const albumRepository = AppDataSource.getRepository(Album);
    const albums = await albumRepository.find({
      relations: ["photos"],
      order: { createdAt: "DESC" },
    });

    // 将 TypeORM 实体转换为普通对象，以便传递给客户端组件
    serializedAlbums = albums.map((album) => ({
      id: album.id,
      name: album.name,
      createdAt: album.createdAt.toISOString(),
      photos:
        album.photos?.map((photo) => ({
          id: photo.id,
          url: photo.url,
        })) || [],
    }));
  } catch (error) {
    console.error("数据库连接失败，显示空列表:", error);
    // 如果数据库连接失败，继续使用空列表
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <main className="container mx-auto p-4 max-w-7xl">
        {/* 页面标题和操作区域 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">
            四川文产2025军训相册
          </h1>
          <Link href="/admin">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="w-full sm:w-auto"
            >
              管理相册
            </Button>
          </Link>
        </div>

        {/* 相册列表 */}
        {serializedAlbums.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {serializedAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <Empty
              description="暂无相册"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Link href="/admin" className="mt-4">
              <Button type="primary" icon={<PlusOutlined />}>
                创建第一个相册
              </Button>
            </Link>
          </div>
        )}

        {/* 底部留白，提升移动端体验 */}
        <div className="h-8 md:h-0"></div>
      </main>
    </ConfigProvider>
  );
}
