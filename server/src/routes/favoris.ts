// =============================================================
// Ici c'est "l'aiguillage" :
// Si quelqu'un appelle POST /favoris ça envoie vers la fonction favoris du controller
// Juste un intermédiaire entre l'URL et la logique
// ROUTES FAVORIS - Definit les URLs pour les favoris
// Quand le frontend appelle /api/favoris ou /api/favoris/:productId
// =============================================================

import { Router } from "express";
import { addFavori, deleteFavori, getFavori } from "../controllers/favoris";
import { authMiddleware } from "../middleware/authMiddleware";

// On cree un "routeur" Express
const router = Router();

// Quand on recoit un POST sur /favoris/:id, on appelle la fonction favori du controller
router.post("/:productId", authMiddleware, addFavori);

// Quand on recoit un DELETE sur /favoris/:id, on appelle la fonction favori du controller
router.delete("/:productId", authMiddleware, deleteFavori);

// Quand on recoit un GET sur /favoris, on appelle la fonction favori du controller
router.get("/", authMiddleware, getFavori);

// On exporte le routeur pour l'utiliser dans index.ts
export default router;
