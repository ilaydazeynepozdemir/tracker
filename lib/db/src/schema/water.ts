import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const waterEntriesTable = pgTable("water_entries", {
  id: serial("id").primaryKey(),
  amountMl: integer("amount_ml").notNull(),
  drinkType: text("drink_type").notNull().default("water"),
  note: text("note"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const goalsTable = pgTable("goals", {
  id: serial("id").primaryKey(),
  goalMl: integer("goal_ml").notNull().default(2000),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertWaterEntrySchema = createInsertSchema(waterEntriesTable).omit({ id: true, createdAt: true });
export type InsertWaterEntry = z.infer<typeof insertWaterEntrySchema>;
export type WaterEntry = typeof waterEntriesTable.$inferSelect;

export const insertGoalSchema = createInsertSchema(goalsTable).omit({ id: true, updatedAt: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goalsTable.$inferSelect;
