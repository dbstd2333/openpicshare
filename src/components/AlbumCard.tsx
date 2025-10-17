"use client";

import { Card, Typography } from "antd";
import Link from "next/link";

const { Title, Text } = Typography;

/**
 * 相册数据接口
 */
interface AlbumData {
  id: number;
  name: string;
  createdAt: string;
  photos: Array<{
    id: number;
    url: string;
  }>;
}

/**
 * 相册卡片组件
 * 显示相册信息和缩略图，支持移动端优化
 */
export function AlbumCard({ album }: { album: AlbumData }) {
  // 获取相册第一张图片作为缩略图
  const thumbnail = album.photos?.[0]?.url || "/placeholder.jpg";
  
  return (
    <Link href={`/album/${album.id}`}>
      <Card
        hoverable
        cover={
          <div className="aspect-square overflow-hidden">
            <img 
              src={thumbnail} 
              alt={album.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        }
        className="shadow-md hover:shadow-lg transition-all duration-300 h-full"
        bodyStyle={{ padding: "12px" }}
      >
        <Card.Meta
          title={
            <Title level={5} className="mb-2 truncate" ellipsis={{ rows: 1 }}>
              {album.name}
            </Title>
          }
          description={
            <div>
              <Text type="secondary" className="text-sm">
                {album.photos?.length || 0} 张图片
              </Text>
              <Text type="secondary" className="text-xs block mt-1">
                {new Date(album.createdAt).toLocaleDateString()}
              </Text>
            </div>
          }
        />
      </Card>
    </Link>
  );
}