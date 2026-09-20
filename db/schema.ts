import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
