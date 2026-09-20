import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  status: text("status").notNull().default("pending"),
  confirmationTokenHash: text("confirmation_token_hash").notNull(),
  confirmationExpiresAt: text("confirmation_expires_at").notNull(),
  confirmedAt: text("confirmed_at"),
  onboardingSentAt: text("onboarding_sent_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const signupAttempts = sqliteTable(
  "signup_attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    subjectHash: text("subject_hash").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_signup_attempts_subject_created_at").on(
      table.subjectHash,
      table.createdAt,
    ),
  ],
);
