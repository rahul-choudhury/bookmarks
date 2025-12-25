"use server";

import { unfurl } from "unfurl.js";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookmarksTable } from "@/lib/db/bookmarks";
import { verifySession } from "./dal";
import z from "zod";
import { queue } from "./meta-queue";
import { transformUrl } from "./utils";

const bookmarkSchema = z.array(
  z.object({
    url: z.string(),
    title: z.union([z.string(), z.null()]),
    favicon: z.union([z.string(), z.null()]),
    timeStamp: z.iso.datetime(),
  }),
);

export async function importBookmarks(state: unknown, formData: FormData) {
  const session = await verifySession();
  if (!session) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const json = formData.get("json");
  if (
    !json ||
    typeof json === "string" ||
    !json.type?.startsWith("application/json")
  ) {
    return {
      success: false,
      message: "Invalid/No file found.",
    };
  }

  const text = await json.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return {
      success: false,
      message: "Invalid/No file found.",
    };
  }

  const validatedData = bookmarkSchema.safeParse(data);
  if (!validatedData.success) {
    return {
      success: false,
      message: "Invalid/No file found.",
    };
  }

  try {
    await db
      .insert(bookmarksTable)
      .values(
        validatedData.data.map((item) => ({
          ...item,
          timeStamp: new Date(item.timeStamp),
          userId: session.userId,
        })),
      )
      .onConflictDoNothing();

    revalidatePath("/");

    return {
      success: true,
      message: "Bookmarks imported successfully.",
    };
  } catch {
    return {
      success: false,
      message: "Failed to record data into the database. Try again later.",
    };
  }
}

export async function saveLinkToDB(state: unknown, url: string) {
  const session = await verifySession();
  if (!session) return null;

  url = transformUrl(url);

  try {
    await db
      .insert(bookmarksTable)
      .values({
        url,
        title: null,
        favicon: null,
        userId: session.userId,
      })
      .onConflictDoNothing();

    revalidatePath("/");
    queue.add(url, session.userId);

    return {
      success: true,
      message: "Bookmark saved.",
    };
  } catch {
    return {
      success: false,
      message: "Bookmark already exists.",
    };
  }
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

  return {
    success: true,
    message: "Bookmark title updated successfully.",
  };
}
