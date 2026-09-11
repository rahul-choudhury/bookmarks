ALTER TABLE bookmarks ADD COLUMN user_id TEXT REFERENCES user(id) ON DELETE CASCADE;
DROP INDEX bookmarks_url_unique;
CREATE UNIQUE INDEX bookmarks_user_url_unique ON bookmarks(user_id, url);
CREATE INDEX bookmarks_user_date_idx ON bookmarks(user_id, "timeStamp");
