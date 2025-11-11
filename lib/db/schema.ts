import { pgTable, varchar, timestamp, uuid } from "drizzle-orm/pg-core";

export const bookmarksTable = pgTable("bookmarks", {
  id: uuid().primaryKey().defaultRandom(),
  url: varchar({ length: 2048 }).notNull().unique(),
  title: varchar({ length: 500 }),
  favicon: varchar({ length: 2048 }),
  timeStamp: timestamp().notNull().defaultNow(),
});

export type Bookmark = typeof bookmarksTable.$inferSelect;
