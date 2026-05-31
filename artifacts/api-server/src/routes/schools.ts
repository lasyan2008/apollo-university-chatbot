import { Router, type IRouter } from "express";
import { schoolsData } from "../lib/schoolsData";

const router: IRouter = Router();

router.get("/schools", async (_req, res): Promise<void> => {
  res.json(schoolsData);
});

export default router;
