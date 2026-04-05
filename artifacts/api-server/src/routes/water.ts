import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, waterEntriesTable, goalsTable } from "@workspace/db";
import {
  CreateWaterEntryBody,
  DeleteWaterEntryParams,
} from "@workspace/api-zod";
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const router: IRouter = Router();

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function parseDate(d: string): Date {
  return new Date(d + "T00:00:00Z");
}

async function getGoalMl(): Promise<number> {
  const [goal] = await db.select().from(goalsTable).limit(1);
  return goal?.goalMl ?? 2000;
}

async function getStreakCount(): Promise<number> {
  const today = todayDate();
  const goalMl = await getGoalMl();

  let streak = 0;
  let checkDate = new Date();
  checkDate.setDate(checkDate.getDate() - 1);

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const entries = await db
      .select()
      .from(waterEntriesTable)
      .where(eq(waterEntriesTable.date, dateStr));

    const total = entries.reduce((sum, e) => sum + e.amountMl, 0);
    if (total >= goalMl) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const todayEntries = await db
    .select()
    .from(waterEntriesTable)
    .where(eq(waterEntriesTable.date, today));
  const todayTotal = todayEntries.reduce((sum, e) => sum + e.amountMl, 0);
  if (todayTotal >= goalMl) {
    streak++;
  }

  return streak;
}

router.get("/water/entries", async (req, res): Promise<void> => {
  const rawDate = typeof req.query.date === "string" ? req.query.date : undefined;
  if (rawDate !== undefined && !DATE_REGEX.test(rawDate)) {
    res.status(400).json({ error: "Invalid date format. Expected YYYY-MM-DD" });
    return;
  }

  const date = rawDate ?? todayDate();

  const entries = await db
    .select()
    .from(waterEntriesTable)
    .where(eq(waterEntriesTable.date, date))
    .orderBy(desc(waterEntriesTable.createdAt));

  res.json(entries.map(e => ({
    id: e.id,
    amountMl: e.amountMl,
    drinkType: e.drinkType,
    note: e.note ?? null,
    createdAt: e.createdAt.toISOString(),
    date: e.date,
  })));
});

router.post("/water/entries", async (req, res): Promise<void> => {
  const parsed = CreateWaterEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const today = todayDate();
  const [entry] = await db
    .insert(waterEntriesTable)
    .values({
      amountMl: parsed.data.amountMl,
      drinkType: parsed.data.drinkType ?? "water",
      note: parsed.data.note ?? null,
      date: today,
    })
    .returning();

  res.status(201).json({
    id: entry.id,
    amountMl: entry.amountMl,
    drinkType: entry.drinkType,
    note: entry.note ?? null,
    createdAt: entry.createdAt.toISOString(),
    date: entry.date,
  });
});

router.delete("/water/entries/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteWaterEntryParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(waterEntriesTable)
    .where(eq(waterEntriesTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/water/summary", async (req, res): Promise<void> => {
  const today = todayDate();
  const goalMl = await getGoalMl();

  const entries = await db
    .select()
    .from(waterEntriesTable)
    .where(eq(waterEntriesTable.date, today));

  const totalMl = entries.reduce((sum, e) => sum + e.amountMl, 0);
  const percentage = goalMl > 0 ? (totalMl / goalMl) * 100 : 0;
  const streak = await getStreakCount();

  res.json({
    totalMl,
    goalMl,
    percentage: Math.round(percentage * 10) / 10,
    streak,
    entriesCount: entries.length,
    date: today,
  });
});

router.get("/water/history", async (req, res): Promise<void> => {
  const goalMl = await getGoalMl();

  const days: { date: string; totalMl: number; goalMl: number; goalMet: boolean }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    const entries = await db
      .select()
      .from(waterEntriesTable)
      .where(eq(waterEntriesTable.date, dateStr));

    const totalMl = entries.reduce((sum, e) => sum + e.amountMl, 0);
    days.push({
      date: dateStr,
      totalMl,
      goalMl,
      goalMet: totalMl >= goalMl,
    });
  }

  res.json(days);
});

export default router;
