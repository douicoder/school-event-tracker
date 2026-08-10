import type { ClassRow, NewClass } from "@/db/schema";

export interface IClassesRepository {
  findById(id: string): Promise<ClassRow | null>;
  findByName(name: string): Promise<ClassRow | null>;
  listAll(): Promise<ClassRow[]>;
  create(data: NewClass): Promise<ClassRow>;
  update(id: string, data: { name?: string; description?: string | null }): Promise<ClassRow>;
  deleteById(id: string): Promise<void>;
}
