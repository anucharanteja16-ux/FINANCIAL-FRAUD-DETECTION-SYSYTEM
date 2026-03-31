import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { analysesTable } from "@workspace/db/schema";
import { desc, count, avg, sql, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard", async (_req, res) => {
  const [totals] = await db
    .select({
      totalAnalyzed: count(),
      fraudCount: sql<number>`SUM(CASE WHEN classification = 'fraud' THEN 1 ELSE 0 END)`,
      spamCount: sql<number>`SUM(CASE WHEN classification = 'spam' THEN 1 ELSE 0 END)`,
      safeCount: sql<number>`SUM(CASE WHEN classification = 'safe' THEN 1 ELSE 0 END)`,
      avgRiskScore: avg(analysesTable.riskScore),
    })
    .from(analysesTable);

  const total = Number(totals?.totalAnalyzed ?? 0);
  const fraudCount = Number(totals?.fraudCount ?? 0);
  const spamCount = Number(totals?.spamCount ?? 0);
  const safeCount = Number(totals?.safeCount ?? 0);

  const urlResults = await db.select({ detectedUrls: analysesTable.detectedUrls }).from(analysesTable);
  let urlsChecked = 0;
  let suspiciousUrls = 0;
  for (const row of urlResults) {
    const urls = row.detectedUrls as Array<{ isSuspicious: boolean }>;
    urlsChecked += urls.length;
    suspiciousUrls += urls.filter(u => u.isSuspicious).length;
  }

  res.json({
    totalAnalyzed: total,
    fraudCount,
    spamCount,
    safeCount,
    fraudRate: total > 0 ? Math.round((fraudCount / total) * 100) : 0,
    urlsChecked,
    suspiciousUrls,
    avgRiskScore: Math.round(Number(totals?.avgRiskScore ?? 0)),
  });
});

router.get("/recent", async (_req, res) => {
  const items = await db
    .select()
    .from(analysesTable)
    .orderBy(desc(analysesTable.analyzedAt))
    .limit(10);

  res.json(
    items.map(item => ({
      id: item.id,
      channel: item.channel,
      classification: item.classification,
      riskScore: item.riskScore,
      messagePreview: item.message.substring(0, 80) + (item.message.length > 80 ? "..." : ""),
      analyzedAt: item.analyzedAt.toISOString(),
    }))
  );
});

router.get("/breakdown", async (_req, res) => {
  const channelRows = await db
    .select({
      channel: analysesTable.channel,
      classification: analysesTable.classification,
      cnt: count(),
    })
    .from(analysesTable)
    .groupBy(analysesTable.channel, analysesTable.classification);

  const channelMap: Record<string, Record<string, number>> = {};
  for (const row of channelRows) {
    if (!channelMap[row.channel]) channelMap[row.channel] = { safe: 0, spam: 0, fraud: 0 };
    channelMap[row.channel][row.classification] = Number(row.cnt);
  }
  const byChannel = Object.entries(channelMap).map(([channel, counts]) => ({
    channel,
    safe: counts.safe ?? 0,
    spam: counts.spam ?? 0,
    fraud: counts.fraud ?? 0,
  }));

  const classRows = await db
    .select({ classification: analysesTable.classification, cnt: count() })
    .from(analysesTable)
    .groupBy(analysesTable.classification);
  const byClassification = classRows.map(r => ({ classification: r.classification, count: Number(r.cnt) }));

  const weekRows = await db
    .select({
      day: sql<string>`TO_CHAR(analyzed_at, 'Dy')`,
      classification: analysesTable.classification,
      cnt: count(),
    })
    .from(analysesTable)
    .where(sql`analyzed_at >= NOW() - INTERVAL '7 days'`)
    .groupBy(sql`TO_CHAR(analyzed_at, 'Dy')`, analysesTable.classification);

  const dayMap: Record<string, Record<string, number>> = {};
  const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (const day of dayOrder) dayMap[day] = { safe: 0, spam: 0, fraud: 0 };
  for (const row of weekRows) {
    const d = row.day.trim();
    if (!dayMap[d]) dayMap[d] = { safe: 0, spam: 0, fraud: 0 };
    dayMap[d][row.classification] = Number(row.cnt);
  }
  const weeklyTrend = dayOrder.map(day => ({ day, ...dayMap[day] }));

  res.json({ byChannel, byClassification, weeklyTrend });
});

export default router;
