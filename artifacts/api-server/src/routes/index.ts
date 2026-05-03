import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import statsRouter from "./stats";
import newsRouter from "./news";
import activitiesRouter from "./activities";
import teachersRouter from "./teachers";
import studentsRouter from "./students";
import contactsRouter from "./contacts";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(statsRouter);
router.use(newsRouter);
router.use(activitiesRouter);
router.use(teachersRouter);
router.use(studentsRouter);
router.use(contactsRouter);
router.use(settingsRouter);

export default router;
