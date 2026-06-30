import { Router, type IRouter } from "express";
import { db, notificationsTable, depotsTable, vehicleTasksTable } from "@workspace/db";
import { count, eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (req, res): Promise<void> => {
  req.log.info("Fetching dashboard stats");

  const [
    notifCountRows, unreadRows,
    placementRows, resultRows, eventRows,
    unreadPlacementRows, unreadResultRows, unreadEventRows,
    depotRows, taskRows,
  ] = await Promise.all([
    db.select({ count: count() }).from(notificationsTable),
    db.select({ count: count() }).from(notificationsTable).where(eq(notificationsTable.isRead, false)),
    db.select({ count: count() }).from(notificationsTable).where(eq(notificationsTable.type, "Placement")),
    db.select({ count: count() }).from(notificationsTable).where(eq(notificationsTable.type, "Result")),
    db.select({ count: count() }).from(notificationsTable).where(eq(notificationsTable.type, "Event")),
    db.select({ count: count() }).from(notificationsTable).where(and(eq(notificationsTable.type, "Placement"), eq(notificationsTable.isRead, false))),
    db.select({ count: count() }).from(notificationsTable).where(and(eq(notificationsTable.type, "Result"), eq(notificationsTable.isRead, false))),
    db.select({ count: count() }).from(notificationsTable).where(and(eq(notificationsTable.type, "Event"), eq(notificationsTable.isRead, false))),
    db.select().from(depotsTable),
    db.select().from(vehicleTasksTable),
  ]);

  const totalNotifications = Number(notifCountRows[0]?.count ?? 0);
  const unreadNotifications = Number(unreadRows[0]?.count ?? 0);
  const placementNotifications = Number(placementRows[0]?.count ?? 0);
  const resultNotifications = Number(resultRows[0]?.count ?? 0);
  const eventNotifications = Number(eventRows[0]?.count ?? 0);
  const unreadPlacement = Number(unreadPlacementRows[0]?.count ?? 0);
  const unreadResult = Number(unreadResultRows[0]?.count ?? 0);
  const unreadEvent = Number(unreadEventRows[0]?.count ?? 0);
  const totalDepots = depotRows.length;
  const totalVehicleTasks = taskRows.length;

  const avgMechanicHoursUsed =
    depotRows.length > 0
      ? Math.round(depotRows.reduce((s, d) => s + d.mechanicHours, 0) / depotRows.length)
      : 0;

  const avgImpactScore =
    taskRows.length > 0
      ? Math.round(taskRows.reduce((s, t) => s + t.impact, 0) / taskRows.length)
      : 0;

  res.json({
    totalDepots,
    totalVehicleTasks,
    totalNotifications,
    unreadNotifications,
    placementNotifications,
    resultNotifications,
    eventNotifications,
    avgMechanicHoursUsed,
    avgImpactScore,
    unreadPlacement,
    unreadResult,
    unreadEvent,
  });
});

export default router;
