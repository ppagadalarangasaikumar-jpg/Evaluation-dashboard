import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import {
  GetNotificationsQueryParams,
  CreateNotificationBody,
  MarkNotificationReadParams,
  DeleteNotificationParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

router.get("/notifications", async (req, res): Promise<void> => {
  req.log.info("Fetching notifications");

  const parsed = GetNotificationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { type, status } = parsed.data;

  const conditions = [];
  if (type) conditions.push(eq(notificationsTable.type, type));
  if (status === "unread") conditions.push(eq(notificationsTable.isRead, false));
  if (status === "read") conditions.push(eq(notificationsTable.isRead, true));

  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(notificationsTable)
          .where(and(...conditions))
          .orderBy(desc(notificationsTable.createdAt))
      : await db.select().from(notificationsTable).orderBy(desc(notificationsTable.createdAt));

  const sorted = [...rows].sort((a, b) => {
    const wa = TYPE_WEIGHT[a.type] ?? 0;
    const wb = TYPE_WEIGHT[b.type] ?? 0;
    if (wb !== wa) return wb - wa;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const withRank = sorted.map((n, idx) => ({
    id: n.id,
    studentId: n.studentId,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    priority: TYPE_WEIGHT[n.type] ?? 1,
    rank: idx + 1,
    createdAt: n.createdAt.toISOString(),
    readAt: n.readAt ? n.readAt.toISOString() : null,
  }));

  const unreadCount = rows.filter((n) => !n.isRead).length;

  res.json({
    success: true,
    total: rows.length,
    unreadCount,
    data: withRank,
  });
});

router.post("/notifications", async (req, res): Promise<void> => {
  req.log.info("Creating notification");

  const parsed = CreateNotificationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { studentIds, type, title, message } = parsed.data;

  const inserts = studentIds.map((studentId) => ({ studentId, type, title, message }));
  await db.insert(notificationsTable).values(inserts);

  const batchId = crypto.randomUUID();

  res.status(201).json({
    success: true,
    notificationBatchId: batchId,
    createdCount: inserts.length,
  });
});

router.patch("/notifications/read-all", async (req, res): Promise<void> => {
  req.log.info("Marking all notifications as read");

  const updated = await db
    .update(notificationsTable)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notificationsTable.isRead, false))
    .returning();

  res.json({ success: true, updatedCount: updated.length });
});

router.patch("/notifications/:id/read", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = MarkNotificationReadParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [updated] = await db
    .update(notificationsTable)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notificationsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ success: false, message: "Notification not found" });
    return;
  }

  res.json({ success: true, message: "Notification marked as read" });
});

router.delete("/notifications/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteNotificationParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(notificationsTable)
    .where(eq(notificationsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ success: false, message: "Notification not found" });
    return;
  }

  res.json({ success: true, message: "Notification removed" });
});

export default router;
