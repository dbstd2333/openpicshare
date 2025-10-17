import { ImageGrid } from "@/components/ImageGrid";
import { AppDataSource } from "@/db/data-source";
import { Album } from "@/db/entities/Album";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";

/**
 * 相册详情页面
 * 显示指定相册中的所有图片，支持移动端预览
 */
export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 初始化数据库连接
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  
  // 等待params解析
  const { id } = await params;
  
  // 获取相册详情
  const albumRepository = AppDataSource.getRepository(Album);
  const album = await albumRepository.findOne({
    where: { id: parseInt(id) },
    relations: ["photos"]
  });
  
  if (!album) {
    return (
      <main className="container mx-auto p-4">
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold mb-4">相册未找到</h2>
          <Link href="/">
            <Button type="primary" icon={<ArrowLeftOutlined />}>
              返回首页
            </Button>
          </Link>
        </div>
      </main>
    );
  }
  
  // 将照片数据转换为纯对象，确保可以安全传递给客户端组件
  const photosData = album.photos?.map(photo => ({
    id: photo.id,
    url: photo.url,
    albumId: photo.albumId,
    compressionQuality: photo.compressionQuality,
    createdAt: photo.createdAt.toISOString()
  })) || [];
  
  return (
    <main className="container mx-auto p-4 max-w-7xl">
      {/* 返回按钮 - 移动端友好 */}
      <div className="mb-4">
        <Link href="/">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            className="flex items-center text-gray-600 hover:text-black"
          >
            返回相册列表
          </Button>
        </Link>
      </div>
      
      {/* 相册标题和统计信息 */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{album.name}</h1>
        <p className="text-gray-600">
          共 {album.photos?.length || 0} 张图片
        </p>
      </div>
      
      {/* 图片网格 - 移动端预览功能已集成在ImageGrid组件中 */}
      <div className="touch-pan-y">
        <ImageGrid photos={photosData} />
      </div>
      
      {/* 底部留白，提升移动端体验 */}
      <div className="h-8 md:h-0"></div>
    </main>
  );
}