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
//RÉCUPÉRER LES DÉTAILS COMPLETS D'UNE COMMANDE
// Route : GET /api/orders/:orderId
// ---------------------------------------------------------

async function getOrder(req: Request, res: Response) {
  try {
    const { orderId } = req.params;

    // 1. Récupérer la commande principale
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    // 2. Récupérer les lignes de commande avec un "deep populate"
    // OrderLine -> Variation -> Product
    const orderLines = await OrderLine.find({ orderId: orderId }).populate({
      path: "variantId",
      populate: {
        path: "productId",
        model: "Product",
      },
    });

    // 3. Formater les items et récupérer les informations Seller
    const items = await Promise.all(
      orderLines.map(async (line: any) => {
        const variation = line.variantId;
        const product = variation?.productId;

        // Récupération manuelle du Seller via le sellerId du produit
        const mongoose = require("mongoose");
        const Seller = mongoose.model("Seller");
        const sellerInfo = await Seller.findOne(
          { userId: product?.sellerId },
          "shopName",
        );

        return {
          shopName: sellerInfo ? sellerInfo.shopName : "Boutique inconnue",
          name: product?.name || "Produit supprimé",
          images: product?.images || [],
          reference: product?.reference || "N/A",
          color: variation?.color,
          size: variation?.size,
          price: variation?.price, // Prix au moment de la commande (via variation)
          quantity: line.quantity,
        };
      }),
    );

    // 4. Réponse finale structurée
    res.status(200).json({
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: (order as any).createdAt,
      items: items,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des détails :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

// ---------------------------------------------------------
// RÉCUPÉRER TOUTES LES COMMANDES D'UN UTILISATEUR (Liste)
// Route : GET /api/orders/my-orders
// ---------------------------------------------------------
interface SellerDoc {
  shopName: string;
  userId: any;
}
async function getOrderById(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Non autorisé" });

    const orders = await Order.find({ buyerId: userId }).sort({
      createdAt: -1,
    });

    const ordersWithShops = await Promise.all(
      orders.map(async (order: any) => {
        const lines = await OrderLine.find({ orderId: order._id }).populate({
          path: "variantId",
          populate: { path: "productId", select: "sellerId" },
        });

        const sellerIds = [
          ...new Set(
            lines.map((line) =>
              (line.variantId as any)?.productId?.sellerId?.toString(),
            ),
          ),
        ];

        const mongoose = require("mongoose");
        const Seller = mongoose.model("Seller");

        // 2. On utilise l'interface ici pour que sellers soit typé
        const sellers = (await Seller.find(
          { userId: { $in: sellerIds } },
          "shopName",
        )) as SellerDoc[];

        // 3. Plus d'erreur ici car TypeScript sait que s est un SellerDoc
        const shopNames = sellers.map((s) => s.shopName);

        return {
          _id: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          shopNames: shopNames,
        };
      }),
    );

    res.status(200).json(ordersWithShops);
  } catch (error) {
    console.error("Erreur getOrderById:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

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
    res
      .status(201)
      .json({
        message: "Commande créée avec succès",
        orderNumber: generatedOrderNumber,
      });
  } catch (error) {
    console.error("Erreur lors de la création de la commande :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

// Récupérer les produits achetés récents
// Route : GET /api/orders/recent-products
async function getRecentProducts(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Non autorisé" });

    // 1. Calculer la date (12 derniers mois)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    // 2. Récupérer les commandes (Triées par date directement par MongoDB)
    const orders = await Order.find({
      buyerId: userId,
      createdAt: { $gte: twelveMonthsAgo },
    })
      .sort({ createdAt: -1 })
      .lean(); // <--- ici : -1 = Décroissant (Récent -> Ancien)

    if (!orders || orders.length === 0) {
      return res.status(200).json([]);
    }

    // 3. Récupérer toutes les lignes de commande liées
    const orderIds = orders.map((o) => o._id);
    const orderLines = await OrderLine.find({ orderId: { $in: orderIds } })
      .populate({
        path: "variantId",
        populate: {
          path: "productId",
          model: "Product",
        },
      })
      .lean();

    // 4. Formater les produits de manière sécurisée
    const formattedProducts = orderLines
      .map((line: any) => {
        // Sécurité : on vérifie si variantId et productId existent
        const variation = line.variantId;
        const product = variation?.productId;

        // On cherche la commande parente pour la date
        const parentOrder = orders.find(
          (o) => o._id.toString() === line.orderId.toString(),
        );

        // Si le produit n'existe plus en base, on évite le crash
        if (!product) return null;

        return {
          id: line._id,
          name: product.name || "Produit sans nom",
          // On prend la première image du tableau
          img:
            product.images && product.images.length > 0
              ? product.images[0]
              : "/placeholder.png",
          date: parentOrder ? parentOrder.createdAt : new Date(),
          color: variation?.color || "N/A",
          size: variation?.size || "N/A",
        };
      })
      .filter((item) => item !== null); // On enlève les produits qui n'ont pas pu être chargés

    return res.status(200).json(formattedProducts);
  } catch (error: any) {
    console.error("ERREUR CRITIQUE BACKEND:", error);
    return res.status(500).json({
      message: "Erreur serveur",
      details: error.message,
    });
  }
}
// ---------------------------------------------------------
// DELETE ORDER
// Route : DELETE /api/orders/:orderId
// ---------------------------------------------------------

// à créer une fois que les commandes seront implémentées dans la base de données
async function deleteOrder(req: Request, res: Response) {}

export { addOrder, deleteOrder, getOrder, getOrderById, getRecentProducts };
