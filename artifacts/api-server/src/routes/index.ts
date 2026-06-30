import { Router, type IRouter } from "express";
import healthRouter from "./health";
import statsRouter from "./stats";
import vehicleSchedulesRouter from "./vehicleSchedules";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(statsRouter);
router.use(vehicleSchedulesRouter);
router.use(notificationsRouter);

export default router;
