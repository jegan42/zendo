// =============================================================
// CONTROLLER BUYER - Contient la logique pour les pages d'achat
// =============================================================

import { Request, Response } from "express";
import Product from "../models/Product";
import Variation from "../models/Variation";
import User from "../models/User";
import { getUserFromHeaders } from "./utils";
import { Types } from "mongoose";

// ---------------------------------------------------------
// DETAIL PRODUCT
// Route : GET /api/product/:id
// Body attendu : { id, name, description, images, madeInFrance, sellerId }
// ---------------------------------------------------------
async function getProduct(req: Request, res: Response) {
  try {
    // Etape 1 : recupere l'id du produit dans les params de l'URL
    const productId = req.params.id;

    // Etape 2 : check produit par son id et recupere aussi les variations de ce produit
    const product = await Product.findById({ _id: productId });
    // find() et pas findById() car on cherche TOUTES les variations du produit (pas une seule par ID)
    const productVariations = await Variation.find({
      productId: productId,
    });

    // Etape 3 : renvoyer le produit trouvé

    // Code 200 = "OK"
    return res.status(200).json({
      message: "Produit trouvé",
      product: product,
      productVariations: productVariations,
    });
  } catch (error) {
    console.error("Erreur product:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// ---------------------------------------------------------
// AJOUT FAVORIS
// Route : POST /api/favoris/:productId
// Body attendu : { id }
// ---------------------------------------------------------

async function addFavori(req: Request, res: Response) {
  try {
    // Etape 1 : recupere l'id du produit et le user id depuis le token
    const userId = getUserFromHeaders(req);
    if (!userId) {
      return res.status(401).json({ message: "Non autorise" });
    }
    const productId = req.params.productId as unknown as Types.ObjectId;

    // Etape 2 : check user par son id et check produit par son id
    const user = await User.findById({ _id: userId });
    const product = await Product.findById({ _id: productId });

    // Etape 3 : verifier que user et produit existent
    if (!user || !product) {
      return res
        .status(404)
        .json({ message: "Utilisateur ou produit non trouvé" });
    }

    // Etape 4 : verifier que le productId n'est pas deja dans les favoris
    if (user.favoris && user.favoris.includes(productId)) {
      return res.status(400).json({ message: "Article déjà dans les favoris" });
    }

    // Etape 5 : met à jour le user en ajoutant le produit à sa liste de favoris (champ favoris dans la collection User)
    const addFavori = await User.updateOne(
      { _id: userId },
      { $push: { favoris: productId } },
    );

    // Code 200 = "OK"
    return res.status(200).json({
      message: "Article ajouté aux favoris",
      addFavori: addFavori,
    });
  } catch (error) {
    console.error("Erreur product:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
// ---------------------------------------------------------
// DELETE FAVORIS
// Route : DELETE /api/favoris/:productId
// ---------------------------------------------------------

async function deleteFavori(req: Request, res: Response) {
  try {
    // Etape 1 : recupere l'id du produit et le user id depuis le token
    const userId = getUserFromHeaders(req);
    if (!userId) {
      return res.status(401).json({ message: "Non autorise" });
    }
    const productId = req.params.productId as unknown as Types.ObjectId;

    // Etape 2 : check user par son id et check produit par son id
    const user = await User.findById({ _id: userId });
    const product = await Product.findById({ _id: productId });

    // Etape 3 : verifier que user et produit existent
    if (!user || !product) {
      return res
        .status(404)
        .json({ message: "Utilisateur ou produit non trouvé" });
    }

    // Etape 4 : verifier que le productId est dans les favoris
    if (!user.favoris || !user.favoris.includes(productId)) {
      return res
        .status(400)
        .json({ message: "Article non présent dans les favoris" });
    }

    // Etape 5 : met à jour le user en supprimant le produit de sa liste de favoris
    const deleteFavori = await User.updateOne(
      { _id: userId },
      { $pull: { favoris: productId } },
    );

    // Code 200 = "OK"
    return res.status(200).json({
      message: "Article supprimé des favoris",
      deleteFavori: deleteFavori,
    });
  } catch (error) {
    console.error("Erreur login:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// ---------------------------------------------------------
// GET FAVORIS
// Route : GET /api/favoris
// Description : Récupère tous les produits favoris de l'utilisateur
// ---------------------------------------------------------

async function getFavori(req: Request, res: Response) {
  try {
    // Etape 1 : recupere l'id utilisateur depuis le token JWT
    const userId = getUserFromHeaders(req);
    if (!userId) {
      return res.status(401).json({ message: "Non autorise" });
    }

    // Etape 2 : check user par son id et recupere son tableau de favoris
    const user = await User.findById({ _id: userId }).populate("favoris");

    // Etape 3 : verifier que l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Etape 4 : renvoyer les favoris de l'utilisateur
    return res.status(200).json({
      message: "Favoris récupérés",
      favoris: user.favoris || [],
    });
  } catch (error) {
    console.error("Erreur getFavori:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export { getProduct, addFavori, deleteFavori, getFavori };
