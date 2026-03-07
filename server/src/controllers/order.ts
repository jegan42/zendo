// =============================================================
// CONTROLLER BUYER - Contient la logique pour les pages de commande
// =============================================================

import { Request, Response } from "express";
import Product from "../models/Product";
import Variation from "../models/Variation";
import User from "../models/User";
import { getUserFromHeaders } from "./utils";
import { Types } from "mongoose";
import Order from "../models/Order";
import OrderLine from "../models/OrderLine";

// ---------------------------------------------------------
// DETAIL ORDER
// Route : GET /api/orders/:orderId
// ---------------------------------------------------------

// à créer une fois que les commandes seront implémentées dans la base de données

async function getOrder(req: Request, res: Response) {}

// ---------------------------------------------------------
// AJOUT ORDER
// Route : POST /api/orders
// Body attendu : { productId, totalPrice }
// ---------------------------------------------------------

async function addOrder(req: Request, res: Response) {
  try {
    // Etape 1 : recupere l'id du produit et le user id depuis le token
    const userId = getUserFromHeaders(req);
    if (!userId) {
      return res.status(401).json({ message: "Non autorise" });
    }

    // Etape 2 : check user par son id et check produit par son id
    const user = await User.findById({ _id: userId }, "cart").populate(
      "cart.product",
    );
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    // Etape 3 : créer un order principal qui contiendra le userId, le statut du paiement et le montant total
    let totalPrice = req.body.totalPrice;
    const addOrder = await Order.create({
      buyerId: userId,
      status: "pending_payment",
      totalAmount: totalPrice,
    });
    // boucle sur chaque item du panier
    // pour chaque item trouver le_id de la variation correspondante dans la collection Variation en fonction du produit, de la couleur et de la taille choisie par l'utilisateur
    for (let i = 0; i < user.cart.length; i++) {
      let variantId = "";
      const variation = await Variation.findOne({
        productId: user.cart[i].product._id,
        color: user.cart[i].color,
        size: user.cart[i].size,
      });
      // toujours dans la boucle, on récupère la quantité
      const quantity = user.cart[i].quantity;
      // Etape 4 :on ajoute une ligne de commande (orderLine) pour chaque item du panier avec le variantId, la quantité, l'orderId et on le save en bdd collection orderLine
      // on créé un orderLine avec le variantId, la quantité, l'orderId et on le save en bdd collection orderLine
      const orderLine = await OrderLine.create({
        variantId: variation?._id,
        quantity: quantity,
        orderId: addOrder._id,
      });
    }
    // Etape 5 : vider le panier de l'utilisateur (champ cart dans la collection User)
    user.cart.splice(0, user.cart.length);
    await user.save();
    // Etape 6 : renvoyer un message de succès au frontend
    res.status(201).json({ message: "Commande créée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la création de la commande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}
// ---------------------------------------------------------
// DELETE ORDER
// Route : DELETE /api/orders/:orderId
// ---------------------------------------------------------

// à créer une fois que les commandes seront implémentées dans la base de données
async function deleteOrder(req: Request, res: Response) {}

export { addOrder, deleteOrder, getOrder };
