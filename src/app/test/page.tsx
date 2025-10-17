"use client";

import { useEffect, useState } from "react";

export default function TestPage() {
  const [cookies, setCookies] = useState<string>("");

  useEffect(() => {
    // 获取所有 cookies
    const allCookies = document.cookie;
    setCookies(allCookies);
  }, []);

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