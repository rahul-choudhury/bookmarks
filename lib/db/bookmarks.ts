import { user } from "@/auth-schema";
import { pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core";

export const bookmarksTable = pgTable("bookmarks", {
  id: uuid().primaryKey().defaultRandom(),
  url: text().notNull(),
  title: text(),
  favicon: text(),
  timeStamp: timestamp().notNull().defaultNow(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export type Bookmark = typeof bookmarksTable.$inferSelect;
