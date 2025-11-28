import { user } from "./auth-schema";
import { pgTable, timestamp, uuid, text, unique } from "drizzle-orm/pg-core";

export const bookmarksTable = pgTable(
  "bookmarks",
  {
    id: uuid().primaryKey().defaultRandom(),
    url: text().notNull(),
    title: text(),
    favicon: text(),
    timeStamp: timestamp().notNull().defaultNow(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [unique().on(table.url, table.userId)],
);

export type Bookmark = typeof bookmarksTable.$inferSelect;
