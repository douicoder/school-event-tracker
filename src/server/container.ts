import { db } from "@/db";
import { ClassController } from "@/server/controllers/class.controller";
import { EventController } from "@/server/controllers/event.controller";
import { UserController } from "@/server/controllers/user.controller";
import { AuthManager } from "@/server/managers/auth.manager";
import { ClassManager } from "@/server/managers/class.manager";
import { EventManager } from "@/server/managers/event.manager";
import { UserManager } from "@/server/managers/user.manager";
import { ClassesRepository } from "@/server/repositories/classes.repository";
import { EventsRepository } from "@/server/repositories/events.repository";
import { UsersRepository } from "@/server/repositories/users.repository";

export const usersRepository = new UsersRepository(db);
export const classesRepository = new ClassesRepository(db);
export const eventsRepository = new EventsRepository(db);

export const authManager = new AuthManager(usersRepository);
export const classManager = new ClassManager(classesRepository);
export const eventManager = new EventManager(eventsRepository, classesRepository);
export const userManager = new UserManager(usersRepository);

export const classController = new ClassController(classManager);
export const eventController = new EventController(eventManager);
export const userController = new UserController(userManager);
