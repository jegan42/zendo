import { Router } from "express";
import { addOrder, deleteOrder, getOrder } from "../controllers/order";

// On cree un "routeur" Express
const router = Router();

// Quand on recoit un POST sur /orders/:id, on appelle la fonction order du controller
router.post("/", addOrder);

// Quand on recoit un DELETE sur /orders/:id, on appelle la fonction order du controller
router.delete("/:orderId", deleteOrder);

// Quand on recoit un GET sur /orders, on appelle la fonction order du controller
router.get("/", getOrder);

// On exporte le routeur pour l'utiliser dans index.ts
export default router;
