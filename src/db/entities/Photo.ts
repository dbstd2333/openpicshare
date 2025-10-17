import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import type { AlbumEntity, PhotoEntity } from "./types";
import { Album } from "./Album";

/**
 * 照片实体
 * 存储图片信息和所属相册
 */
@Entity()
export class Photo implements PhotoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  albumId: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  compressionQuality: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Album, (album) => album.photos, { onDelete: "CASCADE" })
  album: AlbumEntity;
}
