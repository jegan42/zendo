// =============================================================
// CONTROLLER VARIATION - Logique metier des variantes produit
// Gere la lecture, creation et suppression des variantes
// Chaque variante est liee a un produit via productId (ref)
// =============================================================

import { Request, Response } from "express";
import Variation from "../models/Variation";
import Product from "../models/Product";

// --- GET /api/products/:productId/variations ---
// Recupere toutes les variantes d'un produit
// Exemple : GET /api/products/65abc123/variations
// Retourne : { variations: [...], count: 9 }
async function getVariations(req: Request, res: Response) {
  try {
    const variations = await Variation.find({
      productId: req.params.productId,
    });

    res.json({
      message: "Variations recuperees",
      variations: variations,
      count: variations.length,
    });
  } catch (error) {
    console.error("Erreur getVariations:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

// --- POST /api/products/:productId/variations ---
// Cree une nouvelle variante pour un produit
// Body attendu : { color, size, price?, stock? }
// Le productId vient de l'URL (pas du body)
async function createVariation(req: Request, res: Response) {
  try {
    // Verifier que le produit existe
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Produit non trouve" });
    }

    // Verifier les champs obligatoires
    if (!req.body.color || !req.body.size) {
      return res
        .status(400)
        .json({ message: "Couleur et taille sont obligatoires" });
    }

    // Creer la variation
    const variation = new Variation({
      productId: req.params.productId,
      color: req.body.color,
      size: req.body.size,
      price: req.body.price,
      stock: req.body.stock,
    });

    await variation.save();

    res.status(201).json({
      message: "Variation creee",
      variation: variation,
    });
  } catch (error) {
    console.error("Erreur createVariation:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

// --- DELETE /api/variations/:id ---
// Supprime une variante par son ID
async function deleteVariation(req: Request, res: Response) {
  try {
    const variation = await Variation.findByIdAndDelete(req.params.id);

    if (!variation) {
      return res.status(404).json({ message: "Variation non trouvee" });
    }

    res.json({
      message: "Variation supprimee",
      variation: variation,
    });
  } catch (error) {
    console.error("Erreur deleteVariation:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

// --- DELETE /api/variations/product/:productId ---
// Supprime TOUTES les variantes d'un produit
// Utile quand on edite un produit : on supprime tout et on recree
async function deleteVariationsByProduct(req: Request, res: Response) {
  try {
    const productId = req.params.productId;

    const result = await Variation.deleteMany({ productId: productId });

    res.json({
      message: "Variations supprimees",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Erreur deleteVariationsByProduct:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

export { getVariations, createVariation, deleteVariation, deleteVariationsByProduct };
