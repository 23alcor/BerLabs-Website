CREATE TABLE `scheduled_editions` (
	`id` text PRIMARY KEY NOT NULL,
	`scheduled_for` text NOT NULL,
	`subject` text NOT NULL,
	`story_count` integer NOT NULL,
	`recipient_count` integer NOT NULL,
	`status` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `scheduled_editions_scheduled_for_unique` ON `scheduled_editions` (`scheduled_for`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_editions_scheduled_for` ON `scheduled_editions` (`scheduled_for`);