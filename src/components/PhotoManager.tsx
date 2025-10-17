"use client";

import { useState, useEffect } from "react";
import { Card, Table, Button, Modal, Image, Tag, App } from "antd";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

/**
 * 照片数据接口
 */
interface PhotoData {
  id: number;
  url: string;
  albumId: number;
  albumName?: string;
  createdAt: string;
  compressionQuality?: number;
}

/**
 * 照片管理组件
 * 支持查看、删除照片
 */
export function PhotoManager() {
  const { message, modal } = App.useApp();
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<number[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // 获取照片列表
  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/photos");
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      } else {
        message.error("获取照片列表失败");
      }
    } catch (error) {
      console.error("Fetch photos error:", error);
      message.error("获取照片列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 初始化时获取照片列表
  useEffect(() => {
    fetchPhotos();
  }, []);

  // 删除单张照片
  const handleDeletePhoto = async (photoId: number) => {
    modal.confirm({
      title: "确认删除",
      content: "确定要删除这张照片吗？",
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          const response = await fetch(`/api/photos?id=${photoId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            message.success("删除成功");
            fetchPhotos(); // 重新获取照片列表
          } else {
            message.error("删除失败");
          }
        } catch (error) {
          console.error("Delete photo error:", error);
          message.error("删除失败");
        }
      },
    });
  };

  // 批量删除照片
  const handleBatchDelete = async () => {
    if (selectedPhotoIds.length === 0) {
      message.warning("请先选择要删除的照片");
      return;
    }

    modal.confirm({
      title: "批量删除确认",
      content: `确定要删除选中的 ${selectedPhotoIds.length} 张照片吗？`,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          const response = await fetch(`/api/photos?ids=${selectedPhotoIds.join(',')}`, {
            method: "DELETE",
          });

          if (response.ok) {
            const result = await response.json();
            message.success(`成功删除 ${result.deletedCount || selectedPhotoIds.length} 张照片`);
            setSelectedPhotoIds([]);
            fetchPhotos(); // 重新获取照片列表
          } else {
            const error = await response.json();
            message.error(error.error || "批量删除失败");
          }
        } catch (error) {
          console.error("Batch delete error:", error);
          message.error("批量删除失败");
        }
      },
    });
  };

  // 预览照片
  const handlePreview = (url: string) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  // 格式化文件大小
  const formatFileSize = (url: string) => {
    // 这里简化处理，实际应该从服务器获取文件大小
    return "未知";
  };

  // 表格列定义
  const columns: ColumnsType<PhotoData> = [
    {
      title: "预览",
      dataIndex: "url",
      key: "preview",
      width: 100,
      render: (url: string) => (
        <Image
          width={60}
          height={60}
          src={url}
          style={{ objectFit: "cover", cursor: "pointer" }}
          preview={false}
          onClick={() => handlePreview(url)}
        />
      ),
    },
    {
      title: "相册",
      dataIndex: "albumName",
      key: "albumName",
      render: (albumName: string) => albumName || "未知相册",
    },
    {
      title: "压缩质量",
      dataIndex: "compressionQuality",
      key: "compressionQuality",
      width: 120,
      render: (quality: number) => (
        quality ? <Tag color="blue">{quality}%</Tag> : <Tag>未压缩</Tag>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      render: (_, record) => (
        <div className="space-x-2">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record.url)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePhoto(record.id)}
          />
        </div>
      ),
    },
  ];

  // 行选择配置
  const rowSelection = {
    type: 'checkbox' as const,
    selectedRowKeys: selectedPhotoIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedPhotoIds(selectedRowKeys as number[]);
    },
    getCheckboxProps: (record: PhotoData) => ({
      name: record.id,
    }),
    preserveSelectedRowKeys: true,
  };

  return (
    <Card title="照片管理" className="mb-6">
      <div className="mb-4 flex justify-between">
        <div>
          <span>已选择 {selectedPhotoIds.length} 项</span>
        </div>
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={handleBatchDelete}
          disabled={selectedPhotoIds.length === 0}
        >
          批量删除
        </Button>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={photos}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 张照片`,
        }}
      />

      <Image
        style={{ display: "none" }}
        preview={{
          visible: previewVisible,
          src: previewImage,
          onVisibleChange: (visible) => setPreviewVisible(visible),
        }}
      />
    </Card>
  );
}