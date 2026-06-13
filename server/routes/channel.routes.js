import { Router } from "express";
import channelServiceSimulation from "../controller/channel.controller.js";

const router = Router();

router.post("/", channelServiceSimulation);

export default router;
