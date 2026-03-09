// =============================================================
// ROUTES PRODUCT - Aiguillage pour les produits
// Meme logique que routes/auth.ts :
// On recoit l'URL, on envoie vers la bonne fonction du controller
// =============================================================

import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// GET /api/products - recuperer la liste des produits (avec filtres optionnels)
// Exemples :
//   GET /api/products              -> tous les produits
//   GET /api/products?family=Femme -> seulement les produits "Femme"
//   GET /api/products?limit=8      -> seulement 8 produits
router.get("/", getProducts);

// GET by ID
// Exemple : GET /api/products/65a1b2c3d4e5f6g7h8i9j0
router.get("/:id", getProductById);

// POST /api/products - creer un produit (authentifie)
// Body : { name, family, category, reference, sellerId, ... }
router.post("/", authMiddleware, createProduct);

// PUT /api/products/:id - modifier un produit existant (authentifie)
// Body : { name?, description?, family?, category?, ... }
router.put("/:id", authMiddleware, updateProduct);

// DELETE /api/products/:id - supprimer un produit par son ID (authentifie)
router.delete("/:id", authMiddleware, deleteProduct);

export default router;
