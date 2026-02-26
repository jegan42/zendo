import { Router } from "express";
import { updateProfile } from "../controllers/user";

const router = Router();

// Route : PUT /api/users/:id
router.put("/:id", updateProfile);

export default router;