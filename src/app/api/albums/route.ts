import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/db/data-source";
import { Album } from "@/db/entities/Album";
import { ensureDataSourceInitialized } from "@/db/init";

/**
 * 相册CRUD接口
 * GET: 获取所有相册列表
 * POST: 创建新相册
 * PUT: 更新相册信息
 * DELETE: 删除相册
 */
export async function GET() {
  try {
    await ensureDataSourceInitialized();
    const albumRepository = AppDataSource.getRepository(Album);
    const albums = await albumRepository.find({ 
      relations: ["photos"],
      order: { createdAt: "DESC" }
    });
    return NextResponse.json(albums);
  } catch (error) {
    console.error("Get albums error:", error);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDataSourceInitialized();
    const { name } = await req.json();
    
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "相册名称不能为空" },
        { status: 400 }
      );
    }
    
    const albumRepository = AppDataSource.getRepository(Album);
    const album = albumRepository.create({ name: name.trim() });
    await albumRepository.save(album);
    return NextResponse.json(album);
  } catch (error) {
    console.error("Create album error:", error);
    return NextResponse.json(
      { error: "Failed to create album" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureDataSourceInitialized();
    const { id, name } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { error: "缺少相册ID" },
        { status: 400 }
      );
    }
    
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "相册名称不能为空" },
        { status: 400 }
      );
    }
    
    const albumRepository = AppDataSource.getRepository(Album);
    const album = await albumRepository.findOne({ where: { id: parseInt(id) } });
    
    if (!album) {
      return NextResponse.json(
        { error: "相册不存在" },
        { status: 404 }
      );
    }
    
    album.name = name.trim();
    await albumRepository.save(album);
    return NextResponse.json(album);
  } catch (error) {
    console.error("Update album error:", error);
    return NextResponse.json(
      { error: "Failed to update album" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureDataSourceInitialized();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "缺少相册ID" },
        { status: 400 }
      );
    }
    
    const albumRepository = AppDataSource.getRepository(Album);
    const album = await albumRepository.findOne({ 
      where: { id: parseInt(id) },
      relations: ["photos"]
    });
    
    if (!album) {
      return NextResponse.json(
        { error: "相册不存在" },
        { status: 404 }
      );
    }
    
    // 删除相册及其所有照片（级联删除）
    await albumRepository.remove(album);
    return NextResponse.json({ message: "相册删除成功" });
  } catch (error) {
    console.error("Delete album error:", error);
    return NextResponse.json(
      { error: "Failed to delete album" },
      { status: 500 }
    );
  }
}