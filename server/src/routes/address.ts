import { Router } from "express";
import { upsertAddress, getAddressByUserId } from "../controllers/address";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/save", authMiddleware, upsertAddress);
router.get("/", authMiddleware, getAddressByUserId);

export default router;
