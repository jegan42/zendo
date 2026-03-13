// =============================================================
// CONTROLLER BUYER - Contient la logique pour les pages de commande
// =============================================================

import { Request, Response } from "express";
import Product from "../models/Product";
import Variation from "../models/Variation";
import User from "../models/User";
import { Types } from "mongoose";
import Order from "../models/Order";
import OrderLine from "../models/OrderLine";

// ---------------------------------------------------------
// RÉCUPÉRER UNE COMMANDE PAR ORDER ID
// Route : GET /api/orders/:orderId
// ---------------------------------------------------------

// à créer une fois que les commandes seront implémentées dans la base de données

async function getOrder(req: Request, res: Response) {
  try {
    // Etape 1 : recupere l'id de la commande dans les params de l'URL
    const orderId = req.params.orderId;
    console.log("ID de la commande à récupérer :", orderId);
    // Etape 2 : check order par son id
    const order = await Order.findOne({ orderNumber: orderId });
    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    // Etape 3 : retrouver les lignes de commande (orderLine) associées à cette commande pour récupérer les détails des produits commandés (variantId, quantity)
    const orderLines = await OrderLine.find({ orderId: order._id }).populate(
      "variantId",
    );

    // Etape 4 : pour chaque ligne de commande, je récupère le prix, l'image et le productId
    const orderItemPrice = await Promise.all(
      orderLines.map(async (line) => {
        const variant = line.variantId;
        const variantData = await Variation.findById(variant._id).then(
          (data) => {
            return {
              price: data?.price || 0,
              image: data?.images[0] || "/placeholder.png",
              productId: data?.productId || null,
            };
          },
        );
        return {
          ...line.toObject(),
          price: variantData.price,
          image: variantData.image,
          productId: variantData.productId,
        };
      }),
    );
    // Etape 5 : pour chaque ligne enrichie, récupérer le nom du produit
    const orderDetails = await Promise.all(
      orderItemPrice.map(async (line) => {
        const product = await Product.findById(line.productId);
        return {
          ...line,
          productName: product?.name,
        };
      }),
    );
    console.log("Détails des produits commandés :", orderDetails);
    // Etape 6 : renvoyer la commande avec les détails des produits au frontend
    const orderWithDetails = {
      ...order.toObject(),
      items: orderDetails.map((line) => ({
        productName: line.productName,
        quantity: line.quantity,
        price: line.price,
        image: line.image,
      })),
    };
    // Etape  : renvoyer la commande au frontend
    res.status(200).json({ order: orderWithDetails });
    console.log("Commande récupérée:", orderWithDetails);
  } catch (error) {
    console.error("Erreur lors de la récupération de la commande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

// ---------------------------------------------------------
// RÉCUPÉRER TOUTES LES COMMANDES D'UN UTILISATEUR
// Route : GET /api/orders/:id (user id)
// ---------------------------------------------------------

async function getOrderById(req: Request, res: Response) {}

// ---------------------------------------------------------
// AJOUT ORDER
// Route : POST /api/orders
// Body attendu : { productId, totalPrice }
// ---------------------------------------------------------

async function addOrder(req: Request, res: Response) {
  try {
    // Etape 1 : recupere l'id du produit et le user id depuis le token
    const userId = (req as any).userId;
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

    // --- PARRIE AJOUTÉE PAR SIMENG : GÉNÉRATION DU NUMÉRO DE COMMANDE ---
    let isUnique = false;
    let generatedOrderNumber = "";

    while (!isUnique) {
      // Génère un nombre entre 5 et 8 chiffres (ex: 12345 à 99999999)
      generatedOrderNumber = Math.floor(
        Math.random() * (99999999 - 10000 + 1) + 10000,
      ).toString();

      // On vérifie si ce numéro existe déjà dans la collection Order
      const existingOrder = await Order.findOne({
        orderNumber: generatedOrderNumber,
      });
      if (!existingOrder) {
        isUnique = true;
      }
    }

    // Etape 3 : créer un order principal qui contiendra le userId, le statut du paiement et le montant total
    let totalPrice = req.body.totalPrice;
    const addOrder = await Order.create({
      buyerId: userId,
      orderNumber: generatedOrderNumber, // Ajout du numéro de commande généré
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
    res.status(201).json({
      message: "Commande créée avec succès",
      orderNumber: generatedOrderNumber,
    });
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

export { addOrder, deleteOrder, getOrder, getOrderById };
