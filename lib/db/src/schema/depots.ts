import { pgTable, text, integer, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const depotsTable = pgTable("depots", {
  id: uuid("id").primaryKey().defaultRandom(),
  depotId: text("depot_id").notNull().unique(),
  depotName: text("depot_name").notNull(),
  mechanicHours: integer("mechanic_hours").notNull(),
});

export const vehicleTasksTable = pgTable("vehicle_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: text("task_id").notNull(),
  duration: integer("duration").notNull(),
  impact: integer("impact").notNull(),
});

export const insertDepotSchema = createInsertSchema(depotsTable).omit({ id: true });
export const insertVehicleTaskSchema = createInsertSchema(vehicleTasksTable).omit({ id: true });

export type InsertDepot = z.infer<typeof insertDepotSchema>;
export type Depot = typeof depotsTable.$inferSelect;
export type InsertVehicleTask = z.infer<typeof insertVehicleTaskSchema>;
export type VehicleTask = typeof vehicleTasksTable.$inferSelect;
