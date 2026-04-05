import { Router, type IRouter } from "express";
import { db, goalsTable } from "@workspace/db";
import { UpdateGoalBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/goals", async (req, res): Promise<void> => {
  let [goal] = await db.select().from(goalsTable).limit(1);

  if (!goal) {
    [goal] = await db
      .insert(goalsTable)
      .values({ goalMl: 2000 })
      .returning();
  }

  res.json({
    id: goal.id,
    goalMl: goal.goalMl,
    updatedAt: goal.updatedAt.toISOString(),
  });
});

router.put("/goals", async (req, res): Promise<void> => {
  const parsed = UpdateGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let [existing] = await db.select().from(goalsTable).limit(1);

  let goal;
  if (existing) {
    [goal] = await db
      .update(goalsTable)
      .set({ goalMl: parsed.data.goalMl })
      .returning();
  } else {
    [goal] = await db
      .insert(goalsTable)
      .values({ goalMl: parsed.data.goalMl })
      .returning();
  }

  res.json({
    id: goal.id,
    goalMl: goal.goalMl,
    updatedAt: goal.updatedAt.toISOString(),
  });
});

export default router;
