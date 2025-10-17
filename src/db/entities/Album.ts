import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { AlbumEntity, PhotoEntity } from "./types";
import { Photo } from "./Photo";

/**
 * 相册实体
 * 包含相册基本信息和关联的照片
 */
@Entity()
export class Album implements AlbumEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Photo, (photo) => photo.album)
  photos!: PhotoEntity[];
}