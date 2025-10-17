// 类型定义文件，用于解决循环依赖问题

export interface AlbumEntity {
  id: number;
  name: string;
  createdAt: Date;
  photos: PhotoEntity[];
}

export interface PhotoEntity {
  id: number;
  albumId: number;
  url: string;
  compressionQuality: number | null;
  createdAt: Date;
  album: AlbumEntity;
}