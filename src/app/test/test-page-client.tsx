"use client";

import { useEffect, useState } from "react";

/**
 * 测试页面客户端组件
 */
export function TestPageClient() {
  const [cookies, setCookies] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // 获取所有 cookies
    const allCookies = document.cookie;
    setCookies(allCookies);
  }, []);

  // 在客户端渲染之前返回加载状态
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cookie 测试页面</h1>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">当前 Cookies:</h2>
        <pre className="whitespace-pre-wrap">{cookies || "无 cookies"}</pre>
      </div>
      <div className="mt-4">
        <a href="/admin" className="text-blue-500 underline">
          访问管理页面
        </a>
      </div>
    </div>
  );
}