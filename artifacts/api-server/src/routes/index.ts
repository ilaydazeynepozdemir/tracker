import { Router, type IRouter } from "express";
import healthRouter from "./health";
import waterRouter from "./water";
import goalsRouter from "./goals";

const router: IRouter = Router();

router.use(healthRouter);
router.use(waterRouter);
router.use(goalsRouter);

export default router;
