"use client";

import { useState, useEffect } from "react";
import { UploadPanel } from "@/components/UploadPanel";
import { PhotoManager } from "@/components/PhotoManager";
import { AlbumManager } from "@/components/AlbumManager";
import { useRouter } from "next/navigation";
import { Button, Layout, Menu } from "antd";
import { HomeOutlined, LogoutOutlined, PictureOutlined, CloudUploadOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Header, Content, Sider } = Layout;

/**
 * 管理页面
 * 提供相册和照片管理功能，支持移动端优化
 */
export default function AdminPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // 在客户端检测是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // 即使API调用失败，也重定向到登录页面
      router.push("/login");
    }
  };
  
  return (
    <Layout className="min-h-screen">
      <Header className="flex justify-between items-center px-4 md:px-6 bg-white shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold">管理面板</h1>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button icon={<HomeOutlined />} className="flex items-center">
              {isMobile ? "" : "返回首页"}
            </Button>
          </Link>
          <Button 
            onClick={handleLogout}
            icon={<LogoutOutlined />}
            danger
            className="flex items-center"
          >
            {isMobile ? "" : "登出"}
          </Button>
        </div>
      </Header>
      
      <Content className="p-4 md:p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 页面标题和说明 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-2">欢迎使用军训相册管理系统</h2>
            <p className="text-gray-600 text-sm">
              在这里您可以创建相册、上传照片、管理相册内容和批量操作照片。
            </p>
          </div>
          
          {/* 相册管理 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <PictureOutlined className="text-xl mr-2" />
              <h3 className="text-lg font-medium">相册管理</h3>
            </div>
            <AlbumManager />
          </div>
          
          {/* 上传面板 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <CloudUploadOutlined className="text-xl mr-2" />
              <h3 className="text-lg font-medium">照片上传</h3>
            </div>
            <UploadPanel />
          </div>
          
          {/* 照片管理 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <PictureOutlined className="text-xl mr-2" />
              <h3 className="text-lg font-medium">照片管理</h3>
            </div>
            <PhotoManager />
          </div>
        </div>
      </Content>
    </Layout>
  );
}