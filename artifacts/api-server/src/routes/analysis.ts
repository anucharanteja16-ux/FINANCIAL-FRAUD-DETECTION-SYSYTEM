import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { analysesTable } from "@workspace/db/schema";
import { desc, count, avg, sql } from "drizzle-orm";
import { analyzeMessage } from "../lib/fraudDetector.js";
import { z } from "zod/v4";

const router: IRouter = Router();

const analyzeRequestSchema = z.object({
  message: z.string().min(1).max(5000),
  channel: z.enum(["sms", "email", "whatsapp", "other"]),
});

router.post("/", async (req, res) => {
  const parsed = analyzeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  const { message, channel } = parsed.data;
  const result = analyzeMessage(message, channel);

  const [inserted] = await db.insert(analysesTable).values({
    message,
    channel,
    classification: result.classification,
    confidence: result.confidence,
    riskScore: result.riskScore,
    indicators: result.indicators,
    detectedUrls: result.detectedUrls,
    explanation: result.explanation,
  }).returning();

  res.json({
    id: inserted.id,
    message: inserted.message,
    channel: inserted.channel,
    classification: inserted.classification,
    confidence: inserted.confidence,
    riskScore: inserted.riskScore,
    indicators: inserted.indicators,
    detectedUrls: inserted.detectedUrls,
    explanation: inserted.explanation,
    analyzedAt: inserted.analyzedAt.toISOString(),
  });
});

router.get("/", async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;

  const items = await db
    .select()
    .from(analysesTable)
    .orderBy(desc(analysesTable.analyzedAt))
    .limit(limit)
    .offset(offset);

  const [countRow] = await db.select({ total: count() }).from(analysesTable);

  res.json({
    items: items.map(item => ({
      id: item.id,
      message: item.message,
      channel: item.channel,
      classification: item.classification,
      confidence: item.confidence,
      riskScore: item.riskScore,
      indicators: item.indicators,
      detectedUrls: item.detectedUrls,
      explanation: item.explanation,
      analyzedAt: item.analyzedAt.toISOString(),
    })),
    total: countRow?.total ?? 0,
  });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "invalid_id", message: "ID must be a number" });
    return;
  }

  const [item] = await db.select().from(analysesTable).where(sql`${analysesTable.id} = ${id}`);
  if (!item) {
    res.status(404).json({ error: "not_found", message: "Analysis not found" });
    return;
  }

  res.json({
    id: item.id,
    message: item.message,
    channel: item.channel,
    classification: item.classification,
    confidence: item.confidence,
    riskScore: item.riskScore,
    indicators: item.indicators,
    detectedUrls: item.detectedUrls,
    explanation: item.explanation,
    analyzedAt: item.analyzedAt.toISOString(),
  });
});

export default router;
