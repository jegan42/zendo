// =============================================================
// GET SELLER HOME - Dashboard du vendeur
// catch produits et stats
// Plus tard : CA, commandes, top produits
// =============================================================

import { Request, Response } from "express";
import Product from "../models/Product";

// Route : GET /api/seller/:id
// :id = le userId du vendeur (pas le sellerId du model Seller)
//
// On reutilise le virtual populate "variations" du model Product
// (defini par JC dans ProductSchema.virtual)
// Ca evite de refaire manuellement ce que getProducts fait deja
// ---------------------------------------------------------
async function getSellerHome(req: Request, res: Response) {
  try {
    // Etape 1 : recuperer l'ID du vendeur depuis l'URL
    const sellerId = req.params.id;

    if (!sellerId) {
      return res.status(400).json({ message: "ID du vendeur manquant" });
    }

    // Etape 2 : recuperer tous les produits (actifs ET inactifs)

    const products = await Product.find({ sellerId: sellerId })
      .populate("variations")
      .sort({ createdAt: -1 });

    // Etape 3 : les stats de base
    const totalProducts = products.length;

    const activeProducts = products.filter(function (product) {
      return product.status === true;
    }).length;

    const inactiveProducts = totalProducts - activeProducts;

    // Etape 4 : calculer le stock total a partir des variations deja populees
    let totalStock = 0;
    products.forEach(function (product: any) {
      const variations = product.variations || [];
      variations.forEach(function (variation: any) {
        totalStock = totalStock + (variation.stock || 0);
      });
    });

    // Etape 5 : renvoyer les donnees au frontend
    return res.status(200).json({
      message: "Dashboard vendeur recupere avec succes",
      products: products,
      stats: {
        totalProducts: totalProducts,
        activeProducts: activeProducts,
        inactiveProducts: inactiveProducts,
        totalStock: totalStock,
      },
    });
  } catch (error) {
    console.error("Erreur getSellerHome:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export { getSellerHome };
