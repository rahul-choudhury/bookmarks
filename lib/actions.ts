"use server";

import { requireUser } from "./session";
import { revalidatePath } from "next/cache";
import z from "zod";
import { deleteBookmarksById } from "./db/delete-bookmarks";
import { getDb } from "@/lib/db";
import { insertBookmarkSql } from "@/lib/db/bookmarks";
import { getLinkMetadata, getOgImage } from "./metadata";
import { transformUrl } from "./utils";

export async function saveLinkToDB(payload: { url: string; title?: string }) {
  const user = await requireUser();
  const parsed = z
    .object({
      url: z.string().trim().min(1).max(4096),
      title: z.string().trim().max(500).optional(),
    })
    .safeParse(payload);
  if (!parsed.success)
    return {
      success: false,
      message: "Enter a valid link and a title under 500 characters.",
    };
  let url: string;
  try {
    url = transformUrl(parsed.data.url);
  } catch {
    return { success: false, message: "Enter a valid HTTP or HTTPS link." };
  }
  try {
    const db = getDb();
    const existing = db
      .prepare<[string, string], { url: string }>(
        "SELECT url FROM bookmarks WHERE url = ? AND user_id = ?",
      )
      .get(url, user.id);
    if (existing)
      return {
        success: false,
        message: "This link is already saved.",
        existingUrl: existing.url,
      };
    const metadata = await getLinkMetadata(url);
    const bookmark = db.prepare(insertBookmarkSql).run({
      id: crypto.randomUUID(),
      userId: user.id,
      isRead: 0,
      url,
      timeStamp: Date.now(),
      ogImage: getOgImage(metadata, url),
      title: parsed.data.title || metadata?.title?.slice(0, 500) || null,
      favicon: metadata?.favicon?.startsWith("https://")
        ? metadata.favicon
        : null,
    }).changes;
    if (!bookmark)
      return {
        success: false,
        message: "This link is already saved.",
        existingUrl: url,
      };
    revalidatePath("/");
    return { success: true, message: "Link saved." };
  } catch {
    return {
      success: false,
      message: "Couldn’t save this link. Please try again.",
    };
  }
}

export async function deleteBookmark(id: string) {
  const user = await requireUser();
  try {
    const result = getDb()
      .prepare("DELETE FROM bookmarks WHERE id = ? AND user_id = ?")
      .run(id, user.id).changes;
    if (!result) return { success: false, message: "Bookmark not found." };
    revalidatePath("/");
    return { success: true, message: "Link deleted." };
  } catch {
    return {
      success: false,
      message: "Couldn’t delete this link. Please try again.",
    };
  }
}

export async function updateName(id: string, title: string) {
  const user = await requireUser();
  const parsed = z.string().trim().min(1).max(500).safeParse(title);
  if (!parsed.success)
    return {
      success: false,
      message: "Enter a title between 1 and 500 characters.",
    };
  try {
    const result = getDb()
      .prepare("UPDATE bookmarks SET title = ? WHERE id = ? AND user_id = ?")
      .run(parsed.data, id, user.id).changes;
    if (!result) return { success: false, message: "Bookmark not found." };
    revalidatePath("/");
    return { success: true, message: "Changes saved." };
  } catch {
    return {
      success: false,
      message: "Couldn’t save your changes. Please try again.",
    };
  }
}

export async function setBookmarkRead(id: string, isRead: boolean) {
  const user = await requireUser();
  if (typeof id !== "string" || typeof isRead !== "boolean")
    return { success: false, message: "Invalid bookmark status." };
  try {
    const result = getDb()
      .prepare("UPDATE bookmarks SET is_read = ? WHERE id = ? AND user_id = ?")
      .run(isRead ? 1 : 0, id, user.id);
    if (!result.changes)
      return { success: false, message: "Bookmark not found." };
    revalidatePath("/");
    return {
      success: true,
      message: isRead ? "Marked as read." : "Marked as unread.",
    };
  } catch {
    return {
      success: false,
      message: "Couldn’t update reading status. Please try again.",
    };
  }
}

export async function deleteSelectedBookmarks(ids: string[]) {
  const user = await requireUser();
  const parsed = z
    .array(z.string().min(1).max(100))
    .min(1)
    .max(10000)
    .safeParse(ids);
  if (!parsed.success)
    return {
      success: false,
      message: "Select between 1 and 10,000 links to delete.",
    };
  try {
    const count = deleteBookmarksById(getDb(), parsed.data, user.id);
    revalidatePath("/");
    return {
      success: true,
      message: `${count} ${count === 1 ? "link" : "links"} deleted.`,
    };
  } catch {
    return {
      success: false,
      message: "Couldn’t delete the selected links. Please try again.",
    };
  }
}
