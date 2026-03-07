// =============================================================
// CONTROLLER CART - Contient la logique pour les pages de panier
// Le panier est stocke dans le champ "cart" du User (tableau d'IDs produit)
// =============================================================

import { Request, Response } from "express";
import Product from "../models/Product";
import Variation from "../models/Variation";
import User from "../models/User";
import { getUserFromHeaders } from "./utils";
import { Types } from "mongoose";

// ---------------------------------------------------------
// POST ITEM CART
// Route : POST /api/cart/:productId
// Body attendu : { id, color, size, quantity }
// ---------------------------------------------------------
async function addCartItem(req: Request, res: Response) {
  try {
    // Etape 1 : recupere l'id du produit dans les params de l'URL
    const productId = req.params.productId;
    const userId = getUserFromHeaders(req);
    const { size, color, quantity } = req.body;

    // Etape 2 : check produit par son id
    const product = await Product.findById({ _id: productId });
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    // Etape 3 check que les variations sont renseignées
    if (!size || !color || !quantity) {
      return res.status(400).json({
        message: "Veuillez renseigner la taille, la couleur et la quantité",
      });
    }
    // Etape 3 : mise à jour du panier de l'utilisateur en ajoutant le produit avec la variation choisie
    const user = await User.findById({ _id: userId });
    // on vérifie si user et panier existent
    if (user && user.cart) {
      // on vérifie si le produit avec la même variation existe déjà dans le panier
      for (let i = 0; i < user.cart.length; i++) {
        const item = user.cart[i];
        if (
          item.product.equals(productId as any) &&
          item.size === size &&
          item.color === color
        ) {
          // Si le produit avec la même variation existe déjà, on met à jour la quantité
          item.quantity += quantity;
          await user.save();
          return res.status(200).json({
            message: "Produit ajouté au panier",
            addItem: item,
          });
        }
      }
    }

    const addItem = await User.updateOne(
      { _id: userId },
      { $push: { cart: { product: productId, size, color, quantity } } },
    );

    // Code 200 = "OK"
    return res.status(200).json({
      message: "Produit ajouté au panier",
      addItem: addItem,
    });
  } catch (error) {
    console.error("Erreur product:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// ---------------------------------------------------------
// PATCH ITEM CART
// Route : PATCH /api/cart/:productId
// Body attendu : { id, color, size, quantity }
// ---------------------------------------------------------
async function updateCartItem(req: Request, res: Response) {
  try {
    // Etape 1 : recupere l'id du produit dans les params de l'URL
    const productId = req.params.productId;
    const cartItemId = req.params.cartItemId; // l'ID du sous-document dans cart
    const userId = getUserFromHeaders(req);
    const { size, color, quantity } = req.body; // les nouvelles valeurs pour la variation et la quantité

    // Objet de mise à jour en fonction des champs présents dans le corps de la requête
    const updates: any = {};
    // Seuls les champs présents dans le corps de la requête seront mis à jour
    if (size) updates["cart.$.size"] = size;
    if (color) updates["cart.$.color"] = color;
    if (quantity !== undefined && Number(quantity) > 0)
      updates["cart.$.quantity"] = Number(quantity);

    // Etape 2 : check produit par son id
    const product = await Product.findById({ _id: productId });
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    // Etape 3 : mise à jour du panier de l'utilisateur en ajoutant le produit avec la variation choisie
    // Met à jour le sous-document correspondant
    const result = await User.updateOne(
      { _id: userId, "cart._id": cartItemId },
      { $set: updates },
    );

    // Code 200 = "OK"
    return res.status(200).json({
      message: "Produit mis à jour dans le panier",
      result: result,
    });
  } catch (error) {
    console.error("Erreur product:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// ---------------------------------------------------------
// DELETE ITEM CART
// Route : DELETE /api/cart/:productId
// ---------------------------------------------------------

async function deleteCartItem(req: Request, res: Response) {
  try {
    // Etape 1 : recupere l'id du produit et le user id dans les params de l'URL
    const userId = getUserFromHeaders(req);
    const productId = req.params.productId as unknown as Types.ObjectId;
    const cartItemId = req.params.cartItemId; // l'ID du sous-document dans cart

    // Etape 2 : check user par son id et check produit par son id
    const user = await User.findById({ _id: userId });
    const product = await Product.findById({ _id: productId });

    // Etape 3 : verifier que user et produit existent
    if (!user || !product) {
      return res
        .status(404)
        .json({ message: "Utilisateur ou produit non trouvé" });
    }

    // Etape 4 : verifier que le productId est dans le panier
    if (
      !user.cart ||
      !user.cart.some((item) => item.product.equals(productId))
    ) {
      return res
        .status(400)
        .json({ message: "Article non présent dans le panier" });
    }

    // Etape 5 : met à jour le user en supprimant le produit de sa liste de panier
    const deleteCart = await User.updateOne(
      { _id: userId, "cart._id": cartItemId },
      { $pull: { cart: { _id: cartItemId } } },
    );

    // Code 200 = "OK"
    return res.status(200).json({
      message: "Article supprimé du panier",
      deleteCart: deleteCart,
    });
  } catch (error) {
    console.error("Erreur login:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// ---------------------------------------------------------
// GET ITEM CART
// Route : GET /api/cart
// Description : Récupère tous les produits du panier de l'utilisateur
// ---------------------------------------------------------

async function getCartItems(req: Request, res: Response) {
  try {
    // Etape 1 : recupere l'id utilisateur dans les headers
    const userId = getUserFromHeaders(req);

    // Etape 1.5 : vérifier que l'userId n'est pas null
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Etape 2 : check user par son id et recupere son tableau de panier
    const user = await User.findById({ _id: userId }).populate("cart");

    // Etape 3 : verifier que l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Etape 4 : renvoyer les produits du panier de l'utilisateur
    return res.status(200).json({
      message: "Produits du panier récupérés",
      cart: user.cart || [],
    });
  } catch (error) {
    console.error("Erreur getCart:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export { addCartItem, deleteCartItem, getCartItems, updateCartItem };
