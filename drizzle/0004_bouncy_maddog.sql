CREATE TABLE `token_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`model` text NOT NULL,
	`input_tokens` integer NOT NULL,
	`output_tokens` integer NOT NULL,
	`total_tokens` integer NOT NULL,
	`occurred_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_token_usage_occurred_at` ON `token_usage` (`occurred_at`);