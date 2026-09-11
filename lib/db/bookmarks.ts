export type Bookmark = {
  isRead: number;
  id: string;
  url: string;
  title: string | null;
  favicon: string | null;
  ogImage: string | null;
  timeStamp: Date;
};
export type BookmarkRow = Omit<Bookmark, "timeStamp"> & { timeStamp: number };
export const bookmarkColumns =
  'id, url, title, favicon, is_read AS isRead, og_image AS ogImage, "timeStamp"';
export const insertBookmarkSql = `INSERT INTO bookmarks
  (id, url, title, favicon, og_image, "timeStamp", is_read, user_id)
  VALUES (@id, @url, @title, @favicon, @ogImage, @timeStamp, @isRead, @userId)
  ON CONFLICT(user_id, url) DO NOTHING`;
