import { db } from "@/db";
import { ClassController } from "@/server/controllers/class.controller";
import { EventController } from "@/server/controllers/event.controller";
import { DocumentController } from "@/server/controllers/document.controller";
import { UserController } from "@/server/controllers/user.controller";
import { ModerationController } from "@/server/controllers/moderation.controller";
import { AuthManager } from "@/server/managers/auth.manager";
import { ClassManager } from "@/server/managers/class.manager";
import { EventManager } from "@/server/managers/event.manager";
import { DocumentManager } from "@/server/managers/document.manager";
import { UserManager } from "@/server/managers/user.manager";
import { ModerationManager } from "@/server/managers/moderation.manager";
import { ClassesRepository } from "@/server/repositories/classes.repository";
import { EventsRepository } from "@/server/repositories/events.repository";
import { UsersRepository } from "@/server/repositories/users.repository";
import { FlaggedEventsRepository } from "@/server/repositories/flagged-events.repository";
import { DocumentsRepository } from "@/server/repositories/documents.repository";

export const usersRepository = new UsersRepository(db);
export const classesRepository = new ClassesRepository(db);
export const eventsRepository = new EventsRepository(db);
export const flaggedEventsRepository = new FlaggedEventsRepository(db);
export const documentsRepository = new DocumentsRepository(db);

export const authManager = new AuthManager(usersRepository);
export const classManager = new ClassManager(classesRepository);
export const eventManager = new EventManager(
  eventsRepository,
  classesRepository,
);
export const documentManager = new DocumentManager(
  documentsRepository,
  classesRepository,
);
export const userManager = new UserManager(usersRepository);
export const moderationManager = new ModerationManager(flaggedEventsRepository, usersRepository);

export const classController = new ClassController(classManager);
export const eventController = new EventController(eventManager);
export const documentController = new DocumentController(documentManager);
export const userController = new UserController(userManager);
export const moderationController = new ModerationController(moderationManager);
