// =============================================================
// ROUTES SELLER - Aiguillage pour le dashboard vendeur
//
// GET /api/seller/:id  -> dashboard (produits + stats)
//
// Plus tard :
// GET  /api/seller/:id/stats   -> stats detaillees (CA, top produits)
// GET  /api/seller/:id/orders  -> commandes du vendeur
// =============================================================

import { Router } from "express";
import { getSellerHome } from "../controllers/seller";

const router = Router();

router.get("/:id", getSellerHome);

export default router;
