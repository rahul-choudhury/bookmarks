"use server";

import { unfurl } from "unfurl.js";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookmarksTable } from "@/lib/db/bookmarks";
import { auth } from "./auth";
import { success } from "better-auth";

export async function saveLinkToDB(state: unknown, formData: FormData) {
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session) {
    return {
      success: false,
      message: "Not Authenticated.",
    };
  }

  const form = Object.fromEntries(formData);
  let url = form.search as string;

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  let result;

  try {
    result = await unfurl(url);
  } catch {
    return {
      success: false,
      message: "Failed to parse metadata from URL.",
    };
  }

  const { title, favicon } = result;

  try {
    await db.insert(bookmarksTable).values({
      url,
      title: title || null,
      favicon: favicon || null,
      userId: session.user.id,
    });
  } catch {
    return {
      success: false,
      message: "Failed to insert data into DB.",
    };
  }

  revalidatePath("/");

  return {
    success: true,
    message: "Bookmark saved.",
  };
}

export async function deleteBookmark(id: string) {
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session) {
    return {
      success: false,
      message: "Not Authenticated.",
    };
  }

  try {
    const result = await db
      .delete(bookmarksTable)
      .where(
        and(
          eq(bookmarksTable.id, id),
          eq(bookmarksTable.userId, session.user.id),
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
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session) {
    return {
      success: false,
      message: "Not Authenticated.",
    };
  }

  try {
    const result = await db
      .update(bookmarksTable)
      .set({ title })
      .where(
        and(
          eq(bookmarksTable.id, id),
          eq(bookmarksTable.userId, session.user.id),
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
