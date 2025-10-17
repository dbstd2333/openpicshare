"use client";

import { useState, useEffect } from "react";
import { Card, Table, Button, Modal, Form, Input, App } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

/**
 * 相册数据接口
 */
interface AlbumData {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  photoCount?: number;
}

/**
 * 相册管理组件
 * 支持创建、编辑、删除相册
 */
export function AlbumManager() {
  const { message, modal } = App.useApp();
  const [albums, setAlbums] = useState<AlbumData[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<AlbumData | null>(null);
  const [form] = Form.useForm();

  // 获取相册列表
  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/albums");
      if (response.ok) {
        const data = await response.json();
        setAlbums(data);
      } else {
        message.error("获取相册列表失败");
      }
    } catch (error) {
      console.error("Fetch albums error:", error);
      message.error("获取相册列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 初始化时获取相册列表
  useEffect(() => {
    fetchAlbums();
  }, []);

  // 打开创建/编辑相册模态框
  const openModal = (album?: AlbumData) => {
    if (album) {
      setEditingAlbum(album);
      form.setFieldsValue({ name: album.name });
    } else {
      setEditingAlbum(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setModalVisible(false);
    setEditingAlbum(null);
    form.resetFields();
  };

  // 提交表单（创建或编辑相册）
  const handleSubmit = async (values: { name: string }) => {
    try {
      let response;
      
      if (editingAlbum) {
        // 编辑相册
        response = await fetch("/api/albums", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingAlbum.id,
            name: values.name,
          }),
        });
      } else {
        // 创建相册
        response = await fetch("/api/albums", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: values.name }),
        });
      }

      if (response.ok) {
        message.success(editingAlbum ? "相册更新成功" : "相册创建成功");
        closeModal();
        fetchAlbums(); // 重新获取相册列表
      } else {
        const error = await response.json();
        message.error(error.error || "操作失败");
      }
    } catch (error) {
      console.error("Submit album error:", error);
      message.error("操作失败");
    }
  };

  // 删除相册
  const handleDeleteAlbum = async (albumId: number) => {
    modal.confirm({
      title: "删除确认",
      content: "确定要删除这个相册吗？相册内的所有照片也将被删除。",
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          const response = await fetch(`/api/albums?id=${albumId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            message.success("相册删除成功");
            fetchAlbums(); // 重新获取相册列表
          } else {
            const error = await response.json();
            message.error(error.error || "删除失败");
          }
        } catch (error) {
          console.error("Delete album error:", error);
          message.error("删除失败");
        }
      },
    });
  };

  // 表格列定义
  const columns: ColumnsType<AlbumData> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "相册名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "照片数量",
      dataIndex: "photos",
      key: "photoCount",
      width: 120,
      render: (photos: Array<any>) => photos?.length || 0,
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
      width: 150,
      render: (_, record) => (
        <div className="space-x-2">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteAlbum(record.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <Card title="相册管理" className="mb-6">
      <div className="mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          创建相册
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={albums}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 个相册`,
        }}
      />

      <Modal
        title={editingAlbum ? "编辑相册" : "创建相册"}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="相册名称"
            rules={[
              { required: true, message: "请输入相册名称" },
              { max: 50, message: "相册名称不能超过50个字符" },
            ]}
          >
            <Input placeholder="请输入相册名称" />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Button onClick={closeModal} className="mr-2">
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              {editingAlbum ? "更新" : "创建"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}