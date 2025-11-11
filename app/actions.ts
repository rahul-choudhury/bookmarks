"use server";

import { unfurl } from "unfurl.js";

export type Bookmark = {
  url: string;
  title?: string;
  favicon?: string;
  timeStamp: string;
};

const MOCK_DATA_FROM_DB: Bookmark[] = [];

export async function saveLinkToDB(state: Bookmark[], formData: FormData) {
  const form = Object.fromEntries(formData);
  let url = form.search as string;

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  const result = await unfurl(url);
  const { title, favicon } = result;

  MOCK_DATA_FROM_DB.push({
    url,
    title,
    favicon,
    timeStamp: new Date().toISOString(),
  });

  return MOCK_DATA_FROM_DB;
}
