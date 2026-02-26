import { Router } from "express";
import { upsertAddress } from "../controllers/address";

const router = Router();

router.post("/save/:userId", upsertAddress);

export default router;