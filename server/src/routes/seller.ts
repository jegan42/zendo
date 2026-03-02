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
import { createSeller, getSellerHome, getSellerInfos, updateSellerInfos} from "../controllers/seller";

const router = Router();

router.get("/:id", getSellerHome);
router.get("/infos/:id", getSellerInfos);
router.post("/create/:id", createSeller);
router.put("/update/:id", updateSellerInfos);   

export default router;
    