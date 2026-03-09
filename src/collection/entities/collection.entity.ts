// entities/collection.entity.ts
export class Collection {
  id!: string;
  name!: string;
  description?: string;
  playerIDs!: string[];
  createdAt!: Date;
  updatedAt!: Date;
}
