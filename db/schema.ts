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

export const storyCandidates = sqliteTable(
  "story_candidates",
  {
    id: text("id").primaryKey(),
    source: text("source").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull().unique(),
    publishedAt: text("published_at"),
    discoveredAt: text("discovered_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    importance: integer("importance").notNull(),
    summary: text("summary").notNull(),
    whyItMatters: text("why_it_matters").notNull(),
    miniDraft: text("mini_draft").notNull(),
    status: text("status").notNull().default("candidate"),
    selectedForDate: text("selected_for_date"),
    alertedAt: text("alerted_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_story_candidates_status_discovered_at").on(
      table.status,
      table.discoveredAt,
    ),
    index("idx_story_candidates_importance_discovered_at").on(
      table.importance,
      table.discoveredAt,
    ),
  ],
);
