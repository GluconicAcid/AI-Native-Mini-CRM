import { Router } from "express";
import receipt from "../controller/receipt.controller.js";

const router = Router();

router.post("/", receipt);

export default router;
