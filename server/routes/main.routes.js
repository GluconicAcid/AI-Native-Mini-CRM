import { Router } from "express";
import {
    getStats,
    handleTheRequest
} from "../controller/main.controller.js";

const router = Router();

router.post("/campaign", handleTheRequest);
router.get("/campaign/:campaignId/stats", getStats);

export default router;
