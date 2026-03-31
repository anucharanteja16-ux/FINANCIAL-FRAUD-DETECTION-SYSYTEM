import { pgTable, serial, text, integer, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const analysesTable = pgTable("analyses", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  channel: text("channel").notNull(),
  classification: text("classification").notNull(),
  confidence: real("confidence").notNull(),
  riskScore: real("risk_score").notNull(),
  indicators: jsonb("indicators").notNull().$type<Array<{type: string; description: string; severity: string}>>(),
  detectedUrls: jsonb("detected_urls").notNull().$type<Array<{url: string; isSuspicious: boolean; reason: string}>>(),
  explanation: text("explanation").notNull(),
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

export const insertAnalysisSchema = createInsertSchema(analysesTable).omit({ id: true, analyzedAt: true });
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysesTable.$inferSelect;
