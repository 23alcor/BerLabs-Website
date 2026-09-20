CREATE TABLE `story_candidates` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`published_at` text,
	`discovered_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`importance` integer NOT NULL,
	`summary` text NOT NULL,
	`why_it_matters` text NOT NULL,
	`mini_draft` text NOT NULL,
	`status` text DEFAULT 'candidate' NOT NULL,
	`selected_for_date` text,
	`alerted_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `story_candidates_url_unique` ON `story_candidates` (`url`);--> statement-breakpoint
CREATE INDEX `idx_story_candidates_status_discovered_at` ON `story_candidates` (`status`,`discovered_at`);--> statement-breakpoint
CREATE INDEX `idx_story_candidates_importance_discovered_at` ON `story_candidates` (`importance`,`discovered_at`);