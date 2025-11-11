"use server";

import { unfurl } from "unfurl.js";
import { db } from "@/lib/db";
import { bookmarksTable } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

export async function saveLinkToDB(state: unknown, formData: FormData) {
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
  });

  revalidatePath("/");

  return {
    success: true,
    message: "Bookmark saved.",
  };
}
