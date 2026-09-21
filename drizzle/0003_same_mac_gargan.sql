CREATE TABLE `story_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`story_id` text NOT NULL,
	`source` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`published_at` text,
	`is_primary` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `story_sources_url_unique` ON `story_sources` (`url`);--> statement-breakpoint
CREATE INDEX `idx_story_sources_story_id` ON `story_sources` (`story_id`);--> statement-breakpoint
ALTER TABLE `story_candidates` ADD `corroboration` text DEFAULT 'needs_confirmation' NOT NULL;