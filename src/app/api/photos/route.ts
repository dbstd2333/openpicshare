import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/db/data-source";
import { Photo } from "@/db/entities/Photo";
import { Album } from "@/db/entities/Album";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";
import { existsSync } from "fs";

/**
 * 确保数据源已初始化
 */
async function ensureDataSourceInitialized() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}

/**
 * 照片相关接口
 * GET: 获取所有照片列表
 * POST: 上传图片到指定相册
 * DELETE: 删除指定图片
 */
export async function GET(req: NextRequest) {
  try {
    await ensureDataSourceInitialized();
    
    const { searchParams } = new URL(req.url);
    const albumId = searchParams.get("albumId");
    
    const photoRepository = AppDataSource.getRepository(Photo);
    
    // 如果指定了相册ID，只获取该相册的照片
    if (albumId) {
      const photos = await photoRepository.find({
        where: { albumId: parseInt(albumId) },
        relations: ["album"],
        order: { createdAt: "DESC" }
      });
      
      // 格式化返回数据，包含相册名称
      const formattedPhotos = photos.map(photo => ({
        id: photo.id,
        url: photo.url,
        albumId: photo.albumId,
        albumName: photo.album?.name,
        createdAt: photo.createdAt.toISOString(),
        compressionQuality: photo.compressionQuality
      }));
      
      return NextResponse.json(formattedPhotos);
    }
    
    // 否则获取所有照片
    const photos = await photoRepository.find({
      relations: ["album"],
      order: { createdAt: "DESC" }
    });
    
    // 格式化返回数据，包含相册名称
    const formattedPhotos = photos.map(photo => ({
      id: photo.id,
      url: photo.url,
      albumId: photo.albumId,
      albumName: photo.album?.name,
      createdAt: photo.createdAt.toISOString(),
      compressionQuality: photo.compressionQuality
    }));
    
    return NextResponse.json(formattedPhotos);
  } catch (error) {
    console.error("Get photos error:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    await ensureDataSourceInitialized();
    
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const albumId = formData.get("albumId") as string;
    const compressionQuality = formData.get("compressionQuality") as string;
    
    if (!file || !albumId) {
      return NextResponse.json(
        { error: "Missing file or albumId" },
        { status: 400 }
      );
    }
    
    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 生成唯一文件名
    const fileExtension = file.name.split(".").pop() || "jpg";
    const filename = `${randomBytes(16).toString("hex")}.${fileExtension}`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    const uploadPath = join(uploadDir, filename);
    
    // 确保上传目录存在
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // 保存文件
    await writeFile(uploadPath, buffer);
    
    // 保存到数据库
    const photoRepository = AppDataSource.getRepository(Photo);
    const photo = photoRepository.create({
      albumId: parseInt(albumId),
      url: `/uploads/${filename}`,
      compressionQuality: compressionQuality ? parseInt(compressionQuality) : null
    });
    await photoRepository.save(photo);
    
    return NextResponse.json(photo);
  } catch (error) {
    console.error("Upload photo error:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureDataSourceInitialized();
    
    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get("id");
    const photoIds = searchParams.get("ids");
    
    const photoRepository = AppDataSource.getRepository(Photo);
    
    // 单张删除
    if (photoId) {
      const id = parseInt(photoId);
      if (isNaN(id)) {
        return NextResponse.json(
          { error: "Invalid photo id" },
          { status: 400 }
        );
      }
      
      const photo = await photoRepository.findOne({ where: { id } });
      
      if (!photo) {
        return NextResponse.json(
          { error: "Photo not found" },
          { status: 404 }
        );
      }
      
      // 删除文件系统中的文件
      const filePath = join(process.cwd(), "public", photo.url);
      try {
        await unlink(filePath);
      } catch (error) {
        console.error("Failed to delete file:", error);
        // 即使文件删除失败，也继续删除数据库记录
      }
      
      await photoRepository.remove(photo);
      return NextResponse.json({ success: true });
    }
    
    // 批量删除
    else if (photoIds) {
      const ids = photoIds.split(',').map(id => parseInt(id.trim()));
      
      if (ids.some(id => isNaN(id))) {
        return NextResponse.json(
          { error: "Invalid photo ids" },
          { status: 400 }
        );
      }
      
      // 查询所有要删除的照片
      const photosToDelete = await photoRepository.findByIds(ids);
      
      if (photosToDelete.length === 0) {
        return NextResponse.json(
          { error: "No photos found" },
          { status: 404 }
        );
      }
      
      // 删除文件
      for (const photo of photosToDelete) {
        const filePath = join(process.cwd(), "public", photo.url);
        try {
          await unlink(filePath);
        } catch (error) {
          console.error(`Failed to delete file ${photo.url}:`, error);
        }
      }
      
      // 删除数据库记录
      await photoRepository.delete(ids);
      
      return NextResponse.json({ 
        success: true,
        deletedCount: photosToDelete.length
      });
    }
    
    else {
      return NextResponse.json(
        { error: "Missing photo id or ids" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Delete photo error:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}