CREATE TABLE `signup_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject_hash` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_signup_attempts_subject_created_at` ON `signup_attempts` (`subject_hash`,`created_at`);