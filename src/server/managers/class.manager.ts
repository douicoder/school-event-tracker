import type { ClassInfo, CreateClassInput, UpdateClassInput, UserSession } from "@/domain";
import { conflict, notFound } from "@/server/errors";
import { assertAdmin } from "@/server/guards";
import type { IClassesRepository } from "@/server/interfaces/classes.repository.interface";
import type { IClassManager } from "@/server/interfaces/class.manager.interface";
import { toClassInfo } from "@/server/mappers";

export class ClassManager implements IClassManager {
  constructor(private readonly classesRepository: IClassesRepository) {}

  async list(): Promise<ClassInfo[]> {
    const rows = await this.classesRepository.listAll();
    return rows.map(toClassInfo);
  }

  async create(actor: UserSession, input: CreateClassInput): Promise<ClassInfo> {
    assertAdmin(actor);

    const existing = await this.classesRepository.findByName(input.name.trim());
    if (existing) {
      throw conflict(`A class named "${input.name}" already exists`);
    }

    const row = await this.classesRepository.create({
      name: input.name.trim(),
      description: input.description ?? null,
    });
    return toClassInfo(row);
  }

  async update(actor: UserSession, id: string, input: UpdateClassInput): Promise<ClassInfo> {
    assertAdmin(actor);

    const existing = await this.classesRepository.findById(id);
    if (!existing) throw notFound("Class not found");

    const row = await this.classesRepository.update(id, {
      name: input.name?.trim(),
      description: input.description,
    });
    return toClassInfo(row);
  }

  async remove(actor: UserSession, id: string): Promise<void> {
    assertAdmin(actor);

    const existing = await this.classesRepository.findById(id);
    if (!existing) throw notFound("Class not found");

    await this.classesRepository.deleteById(id);
  }
}
