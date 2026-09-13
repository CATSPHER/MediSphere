import express from "express";
import authUser from "../middleware/authUser.js";
import { logIntake, getTodayLogs, getMonthlyLogs, getFeedback } from "../controllers/hydrationController.js";

const hydrationRouter = express.Router();

hydrationRouter.post("/log", authUser, logIntake);
hydrationRouter.get("/logs/today", authUser, getTodayLogs);
hydrationRouter.get("/logs/monthly", authUser, getMonthlyLogs);
hydrationRouter.post("/feedback", authUser, getFeedback);

export default hydrationRouter;