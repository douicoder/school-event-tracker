import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "class_manager"]);

export const eventColorEnum = pgEnum("event_color", [
  "blue",
  "red",
  "green",
  "yellow",
  "purple",
]);

export const classes = pgTable("classes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").default("class_manager").notNull(),
  assignedClassId: uuid("assigned_class_id").references(() => classes.id, {
    onDelete: "set null",
  }),
  name: text("name"),
  isBanned: boolean("is_banned").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    classId: uuid("class_id")
      .references(() => classes.id, { onDelete: "cascade" })
      .notNull(),
    title: text("title").notNull(),
    description: text("description"),
    color: eventColorEnum("color").default("blue").notNull(),
    eventDate: date("event_date", { mode: "string" }).notNull(),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedBy: uuid("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [index("events_class_date_idx").on(table.classId, table.eventDate)],
);

export const usersRelations = relations(users, ({ many }) => ({
  createdEvents: many(events, { relationName: "createdEvents" }),
  updatedEvents: many(events, { relationName: "updatedEvents" }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  createdByUser: one(users, {
    fields: [events.createdBy],
    references: [users.id],
    relationName: "createdEvents",
  }),
  updatedByUser: one(users, {
    fields: [events.updatedBy],
    references: [users.id],
    relationName: "updatedEvents",
  }),
}));

export const flaggedEvents = pgTable("flagged_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  classId: uuid("class_id").references(() => classes.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  color: text("color").notNull(),
  eventDate: text("event_date").notNull(),
  submittedBy: uuid("submitted_by").references(() => users.id, {
    onDelete: "set null",
  }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  isReviewed: boolean("is_reviewed").default(false).notNull(),
});

export const flaggedEventsRelations = relations(flaggedEvents, ({ one }) => ({
  submittedByUser: one(users, {
    fields: [flaggedEvents.submittedBy],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [flaggedEvents.classId],
    references: [classes.id],
  }),
}));

export type ClassRow = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;

export type UserRow = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type EventRow = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type FlaggedEventRow = typeof flaggedEvents.$inferSelect;
export type NewFlaggedEvent = typeof flaggedEvents.$inferInsert;
