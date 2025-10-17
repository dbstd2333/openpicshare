"use client";

import { useState, useEffect } from "react";
import { Card, Form, Select, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

/**
 * 上传面板组件
 * 处理文件选择和上传逻辑
 */
export function UploadPanel() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadFileList, setUploadFileList] = useState<UploadFile<any>[]>([]);
  const [albumId, setAlbumId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [albums, setAlbums] = useState<any[]>([]);
  const [compressionQuality, setCompressionQuality] = useState(70); // 默认压缩质量80%

  // 获取相册列表
  const fetchAlbums = async () => {
    try {
      const response = await fetch("/api/albums");
      const data = await response.json();
      // 确保 data 是数组格式
      if (Array.isArray(data)) {
        setAlbums(data);
      } else {
        console.error("Albums API returned non-array data:", data);
        setAlbums([]);
      }
    } catch (error) {
      console.error("Failed to fetch albums:", error);
      setAlbums([]);
    }
  };

  // 初始化时获取相册列表
  useEffect(() => {
    fetchAlbums();
  }, []);

  /**
   * 压缩图片
   * @param file 原始图片文件
   * @param quality 压缩质量 (0-100)
   * @returns 压缩后的 Blob 对象
   */
  const compressImage = (file: File, quality: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // 计算压缩后的尺寸
        const { width, height } = img;

        canvas.width = width;
        canvas.height = height;

        // 绘制压缩后的图片
        ctx?.drawImage(img, 0, 0, width, height);

        // 转换为 Blob
        canvas.toBlob(
          (blob) => {
            resolve(blob || file); // 如果压缩失败，返回原文件
          },
          "image/jpeg",
          quality / 100,
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !albumId) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = selectedFiles.length;
      let successCount = 0;

      // 逐个上传文件
      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles[i];

        // 压缩图片
        const compressedBlob = await compressImage(file, compressionQuality);
        const compressedFile = new File([compressedBlob], file.name, {
          type: "image/jpeg",
        });

        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("albumId", albumId);
        formData.append("compressionQuality", compressionQuality.toString());

        const response = await fetch("/api/photos", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          successCount++;
        } else {
          console.error(`上传失败: ${file.name}`);
        }

        // 更新进度
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      if (successCount === totalFiles) {
        alert(`全部上传成功！共 ${successCount} 张图片`);
      } else {
        alert(`上传完成，成功 ${successCount}/${totalFiles} 张图片`);
      }

      setSelectedFiles([]);
      setUploadFileList([]);
      setUploadProgress(0);
      // 重新加载页面以显示新图片
      window.location.reload();
    } catch (error) {
      console.error("Upload error:", error);
      alert("上传失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card title="上传图片" className="mb-6">
      <Form layout="vertical">
        <Form.Item label="选择相册">
          <Select
            value={albumId}
            onChange={setAlbumId}
            placeholder="请选择相册"
          >
            {albums.map((album) => (
              <Select.Option key={album.id} value={album.id}>
                {album.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="选择文件">
          <Upload
            multiple
            beforeUpload={(file, fileList) => {
              setSelectedFiles(fileList);
              // 转换为 UploadFile 格式
              const uploadFiles: UploadFile<any>[] = fileList.map((file) => ({
                uid: file.name + Date.now(), // 使用文件名和时间戳作为唯一ID
                name: file.name,
                status: 'done',
                originFileObj: file,
              }));
              setUploadFileList(uploadFiles);
              return false; // 阻止自动上传
            }}
            fileList={uploadFileList}
            accept="image/*"
            showUploadList={{ showRemoveIcon: true }}
            onRemove={(file) => {
              const newFiles = selectedFiles.filter((f) => f.name !== file.name);
              setSelectedFiles(newFiles);
              const newUploadFiles = uploadFileList.filter((f) => f.uid !== file.uid);
              setUploadFileList(newUploadFiles);
            }}
          >
            <Button icon={<UploadOutlined />}>选择图片(支持多选)</Button>
          </Upload>
          {selectedFiles.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              已选择 {selectedFiles.length} 张图片，总大小:{" "}
              {(
                selectedFiles.reduce((acc, file) => acc + file.size, 0) /
                1024 /
                1024
              ).toFixed(2)}{" "}
              MB
            </p>
          )}
        </Form.Item>

        <Form.Item label={`压缩质量: ${compressionQuality}%`}>
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={compressionQuality}
            onChange={(e) => setCompressionQuality(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>高压缩</span>
            <span>低压缩</span>
          </div>
        </Form.Item>

        {uploading && (
          <Form.Item label="上传进度">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{uploadProgress}%</p>
          </Form.Item>
        )}

        <Form.Item>
          <Button
            type="primary"
            onClick={handleUpload}
            loading={uploading}
            disabled={selectedFiles.length === 0 || !albumId}
            block
          >
            {uploading ? "上传中..." : `上传图片 (${selectedFiles.length} 张)`}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
