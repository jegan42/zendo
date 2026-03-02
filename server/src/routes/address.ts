import { Router } from "express";
import { upsertAddress,getAddressByUserId } from "../controllers/address";

const router = Router();

router.post("/save/:userId", upsertAddress);
router.get("/:userId", getAddressByUserId);


export default router;