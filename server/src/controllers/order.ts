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

// ---------------------------------------------------------
// RÉCUPÉRER UNE COMMANDE PAR ORDER ID
// Route : GET /api/orders/:orderId
// ---------------------------------------------------------

// à créer une fois que les commandes seront implémentées dans la base de données

async function getOrder(req: Request, res: Response) {}

// ---------------------------------------------------------
// RÉCUPÉRER TOUTES LES COMMANDES D'UN UTILISATEUR
// Route : GET /api/orders/:id (user id)
// ---------------------------------------------------------

 async function getOrderById(req: Request, res: Response) {}
  
// ---------------------------------------------------------
// AJOUT ORDER
// Route : POST /api/orders/:orderId
// Body attendu : { productId, variationId, quantity, color, size, address, paymentMethod, totalPrice }
// ---------------------------------------------------------

async function addOrder(req: Request, res: Response) {
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

    // Etape 4 : créer la commande dans la base de données (collection Order) avec les informations du produit, de l'utilisateur et de la commande (quantité, adresse, etc)
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