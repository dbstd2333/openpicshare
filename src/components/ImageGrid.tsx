"use client";

import { useState } from "react";
import { Row, Col, Image } from "antd";

/**
 * 照片数据接口
 */
interface PhotoData {
  id: number;
  url: string;
  albumId: number;
  compressionQuality?: number;
  createdAt: string;
}

/**
 * 图片网格组件
 * 显示图片列表，支持移动端预览
 */
export function ImageGrid({ photos }: { photos: PhotoData[] }) {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // 预览图片
  const handlePreview = (url: string) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  return (
    <>
      <Row gutter={[16, 16]}>
        {photos.map((photo) => (
          <Col 
            key={photo.id} 
            xs={12} 
            sm={8} 
            md={6} 
            lg={4.8}
            className="aspect-square overflow-hidden rounded-lg"
          >
            <img 
              src={photo.url} 
              alt=""
              className="w-full h-full object-cover cursor-pointer transition-transform hover:scale-105"
              onClick={() => handlePreview(photo.url)}
            />
          </Col>
        ))}
      </Row>
      
      {/* 图片预览组件 */}
      <Image
        style={{ display: "none" }}
        preview={{
          visible: previewVisible,
          src: previewImage,
          onVisibleChange: (visible) => setPreviewVisible(visible),
        }}
      />
    </>
  );
}