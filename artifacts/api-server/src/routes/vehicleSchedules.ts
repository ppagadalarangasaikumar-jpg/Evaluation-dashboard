import { Router, type IRouter } from "express";
import { db, depotsTable, vehicleTasksTable } from "@workspace/db";

const router: IRouter = Router();

type Task = { taskId: string; duration: number; impact: number };

function chooseBestTasks(tasks: Task[], capacity: number) {
  const n = tasks.length;
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { duration, impact } = tasks[i - 1];
    for (let h = 0; h <= capacity; h++) {
      dp[i][h] = dp[i - 1][h];
      if (duration <= h) {
        const candidate = impact + dp[i - 1][h - duration];
        if (candidate > dp[i][h]) dp[i][h] = candidate;
      }
    }
  }

  const selected: Task[] = [];
  let remaining = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][remaining] !== dp[i - 1][remaining]) {
      selected.push(tasks[i - 1]);
      remaining -= tasks[i - 1].duration;
    }
  }
  selected.reverse();

  const usedHours = selected.reduce((s, t) => s + t.duration, 0);
  const totalImpact = selected.reduce((s, t) => s + t.impact, 0);

  return { usedHours, totalImpact, selectedTasks: selected };
}

router.get("/vehicle-schedules", async (req, res): Promise<void> => {
  req.log.info("Fetching vehicle schedules");

  const [depots, tasks] = await Promise.all([
    db.select().from(depotsTable),
    db.select().from(vehicleTasksTable),
  ]);

  const allTasks: Task[] = tasks.map((t) => ({
    taskId: t.taskId,
    duration: t.duration,
    impact: t.impact,
  }));

  const schedules = depots.map((depot) => {
    const { usedHours, totalImpact, selectedTasks } = chooseBestTasks(allTasks, depot.mechanicHours);
    const efficiency = depot.mechanicHours > 0 ? Math.round((usedHours / depot.mechanicHours) * 100) : 0;
    return {
      depotId: depot.depotId,
      depotName: depot.depotName,
      mechanicHours: depot.mechanicHours,
      usedHours,
      remainingHours: depot.mechanicHours - usedHours,
      totalImpact,
      efficiency,
      selectedTasks,
    };
  });

  res.json({
    success: true,
    depotCount: depots.length,
    vehicleTaskCount: allTasks.length,
    schedules,
  });
});

export default router;
