CREATE TABLE `__new_bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`favicon` text,
	`timeStamp` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_bookmarks`("id", "url", "title", "favicon", "timeStamp") SELECT "id", "url", "title", "favicon", "timeStamp" FROM `bookmarks`;--> statement-breakpoint
DROP TABLE `bookmarks`;--> statement-breakpoint
ALTER TABLE `__new_bookmarks` RENAME TO `bookmarks`;--> statement-breakpoint
CREATE INDEX `bookmarks_date_idx` ON `bookmarks` (`timeStamp`);--> statement-breakpoint
CREATE UNIQUE INDEX `bookmarks_url_unique` ON `bookmarks` (`url`);
--> statement-breakpoint
DROP TABLE `account`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
DROP TABLE `verification`;