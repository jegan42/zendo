import { Router } from "express";
import { addOrder, deleteOrder, getOrder, getOrderById, getRecentProducts } from "../controllers/order";
import { authMiddleware } from "../middleware/authMiddleware";

// On cree un "routeur" Express
const router = Router();

// Quand on recoit un POST sur /orders/:id, on appelle la fonction order du controller
router.post("/", authMiddleware, addOrder);

// Quand on récupère les produits récents de l'utilisateur connecté
router.get("/recent-products", authMiddleware, getRecentProducts);

// Quand on récupère la liste des commandes de l'utilisateur connecté
router.get("/my-orders", authMiddleware, getOrderById);

// Quand on récupère les détails d'une commande spécifique
router.get("/:orderId", authMiddleware, getOrder);

// Quand on recoit un DELETE sur /orders/:id, on appelle la fonction order du controller
router.delete("/:orderId", deleteOrder);

// Quand on recoit un GET sur /orders, on appelle la fonction order du controller
router.get("/", getOrder);

// On exporte le routeur pour l'utiliser dans index.ts
export default router;
