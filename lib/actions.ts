"use server";

import { unfurl } from "unfurl.js";
import { db } from "@/lib/db";
import { bookmarksTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "./auth";
import { headers } from "next/headers";

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

  const result = await unfurl(url);
  const { title, favicon } = result;

  await db.insert(bookmarksTable).values({
    url,
    title: title || null,
    favicon: favicon || null,
    userId: session.user.id,
  });

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

  const bookmark = await db
    .select()
    .from(bookmarksTable)
    .where(eq(bookmarksTable.id, id))
    .limit(1);

  if (bookmark.length === 0) {
    return {
      success: false,
      message: "Bookmark not found.",
    };
  }

  if (bookmark[0].userId !== session.user.id) {
    return {
      success: false,
      message: "You can only delete your own bookmarks.",
    };
  }

  await db.delete(bookmarksTable).where(eq(bookmarksTable.id, id));
  revalidatePath("/");

  return {
    success: true,
    message: "Bookmark deleted.",
  };
}
