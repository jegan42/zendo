import express from "express";
const router = express.Router();

import authRoutes from "./auth";
import productRoutes from "./product";
import variationRoutes from "./variation";
import favorisRoutes from "./favoris";
import cartRoutes from "./cart";
import sellerRoutes from "./seller";
import addressRoutes from "./address";
import orderRoutes from "./order";

// --- ROUTES ---

// Toutes les routes qui commencent par /api/auth sont gerées par authRoutes
// Exemple : POST /api/auth/signup, POST /api/auth/login
//
router.use("/auth", authRoutes);

// Routes produits : GET /api/products, GET /api/products/:id, POST, DELETE
router.use("/products", productRoutes);

// Routes variations : GET /api/variations, GET /api/variations/:id
router.use("/variations", variationRoutes);

// Routes favoris : GET/POST/DELETE /api/favoris/...
router.use("/favoris", favorisRoutes);

// Routes cart : GET/POST/DELETE /api/cart/...
router.use("/cart", cartRoutes);

// Routes seller : GET /api/seller/:id (dashboard vendeur)
router.use("/seller", sellerRoutes);

// Routes address : POST /api/address/save (sauvegarder adresse)
router.use("/address", addressRoutes);

// Routes orders : POST /api/orders/create (creer une commande)
router.use("/orders", orderRoutes);

export default router;
