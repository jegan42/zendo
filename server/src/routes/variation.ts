// =============================================================
// ROUTES VARIATION - Aiguillage pour les variantes produit
// Les variantes sont liees a un produit via productId dans l'URL
//
// GET    /api/products/:productId/variations  -> liste des variantes
// POST   /api/products/:productId/variations  -> creer une variante
// DELETE /api/variations/:id                  -> supprimer une variante
// =============================================================

import { Router } from "express";
import {
  getVariations,
  createVariation,
  deleteVariation,
  deleteVariationsByProduct,
} from "../controllers/variation";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Recuperer toutes les variantes d'un produit
// Exemple : GET /api/products/65abc123/variations
router.get("/products/:productId/variations", getVariations);

// Creer une variante pour un produit (authentifie)
// Body : { color: "Dore", size: "M", stock: 5 }
router.post("/products/:productId/variations", authMiddleware, createVariation);

// Supprimer toutes les variantes d'un produit (authentifie)
// Utile pour l'edition : on supprime tout et on recree
// Exemple : DELETE /api/variations/product/65abc123
router.delete("/product/:productId", authMiddleware, deleteVariationsByProduct);

// Supprimer une variante par son ID (authentifie)
// Exemple : DELETE /api/variations/65xyz789
router.delete("/variations/:id", authMiddleware, deleteVariation);

export default router;
