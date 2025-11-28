"use server";

import { unfurl } from "unfurl.js";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookmarksTable } from "@/lib/db/bookmarks";
import { verifySession } from "./dal";

export async function saveLinkToDB(state: unknown, url: string) {
  const session = await verifySession();
  if (!session) return null;

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  const existing = await db
    .select({ id: bookmarksTable.id })
    .from(bookmarksTable)
    .where(
      and(
        eq(bookmarksTable.url, url),
        eq(bookmarksTable.userId, session.userId),
      ),
    );

  if (existing.length > 0) {
    return {
      success: false,
      message: "Bookmark already exists.",
    };
  }

  let result;

  try {
    result = await unfurl(url);
  } catch {
    return {
      success: false,
      message:
        "Failed to obtain link information. Make sure the link is publicly accessible.",
    };
  }

  const { title, favicon } = result;

  try {
    await db.insert(bookmarksTable).values({
      url,
      title: title || null,
      favicon: favicon || null,
      userId: session.userId,
    });
  } catch {
    return {
      success: false,
      message: "Failed to record data into the database. Try again later.",
    };
  }

  revalidatePath("/");

  return {
    success: true,
    message: "Bookmark saved.",
  };
}

export async function deleteBookmark(id: string) {
  const session = await verifySession();
  if (!session) return null;

  try {
    const result = await db
      .delete(bookmarksTable)
      .where(
        and(
          eq(bookmarksTable.id, id),
          eq(bookmarksTable.userId, session.userId),
        ),
      )
      .returning({ id: bookmarksTable.id });

    if (result.length === 0) {
      return {
        success: false,
        message: "Bookmark not found or unauthorized.",
      };
    }
  } catch {
    return {
      success: false,
      message: "Failed to delete bookmark.",
    };
  }

  revalidatePath("/");

  return {
    success: true,
    message: "Bookmark deleted.",
  };
}

export async function updateName(id: string, title: string) {
  const session = await verifySession();
  if (!session) return null;

  try {
    const result = await db
      .update(bookmarksTable)
      .set({ title })
      .where(
        and(
          eq(bookmarksTable.id, id),
          eq(bookmarksTable.userId, session.userId),
        ),
      )
      .returning({ id: bookmarksTable.id });

    if (result.length === 0) {
      return {
        success: false,
        message: "Bookmark not found or unauthorized.",
      };
    }
  } catch {
    return {
      success: false,
      message: "Failed to update bookmark.",
    };
  }

  revalidatePath("/");
}
