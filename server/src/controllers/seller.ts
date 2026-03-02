// =============================================================
// GET SELLER HOME - Dashboard du vendeur
// catch produits et stats
// Plus tard : CA, commandes, top produits
// =============================================================

import { Request, Response } from "express";
import Product from "../models/Product";
import Seller from "../models/Seller";
import User from "../models/User";

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

// =============================================================
// GET SELLER INFOS - Récupérer les infos de la boutique
// GET /api/seller/infos/:id (où :id est le userId)
// =============================================================
async function getSellerInfos(req: Request, res: Response) {
  try {
    // 1. Récupération de l'ID utilisateur depuis l'URL
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "ID utilisateur manquant" });
    }

    // 2. Recherche du document Seller correspondant à cet UserId
    const seller = await Seller.findOne({ userId: userId });

    if (!seller) {
      // On renvoie un succès avec null pour que le front sache qu'il n'y a pas encore de boutique
      return res.status(200).json(null);
    }

    // 3. Renvoi des informations
    return res.status(200).json(seller);
  } catch (error) {
    console.error("Erreur getSellerInfos:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la récupération des infos boutique" });
  }
}


// =============================================================
// CREATE SELLER - Ouvrir une boutique: POST /api/seller/create/:id
// =============================================================
async function createSeller(req: Request, res: Response) {
  try {
    // 1. Récupération de l'ID depuis l'URL (:id)
    const userId = req.params.id;
    
    // 2. Récupération des infos depuis le body
    const { shopName, siretNumber } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "ID utilisateur manquant dans l'URL" });
    }

    if (!shopName) {
      return res.status(400).json({ message: "Le nom de la boutique est obligatoire" });
    }

    // 3. Création du document Seller
    const newSeller = new Seller({
      userId: userId,
      shopName: shopName,
      siretNumber: siretNumber,
      shopStatus: true
    });

    await newSeller.save();

    // 4. Mise à jour du rôle de l'utilisateur (on ajoute "seller")
    // $addToSet garantit que "seller" n'est ajouté qu'une seule fois au tableau
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { role: "seller" } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.status(201).json({
      message: "Félicitations ! Votre boutique est maintenant ouverte.",
      seller: newSeller,
      user: updatedUser
    });

  } catch (error: any) {
    console.error("Erreur createSeller:", error);
    
    // Gestion de l'erreur d'unicité (un utilisateur = une seule boutique)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Vous avez déjà une boutique enregistrée." });
    }
    
    return res.status(500).json({ message: "Erreur serveur lors de la création de la boutique" });
  }
}

// =============================================================
// UPDATE SELLER INFOS - Modifier les infos de la boutique
// PUT /api/seller/update/:id (où :id est le userId)
// =============================================================
async function updateSellerInfos(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const { shopName, shopLogo, shopStatus, siretNumber } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "ID utilisateur manquant" });
    }

    // On prépare les données à mettre à jour
    // On ne met à jour que ce qui est envoyé dans le body
    const updateData: any = {};
    if (shopName !== undefined) updateData.shopName = shopName;
    if (shopLogo !== undefined) updateData.shopLogo = shopLogo;
    if (shopStatus !== undefined) updateData.shopStatus = shopStatus;
    if (siretNumber !== undefined) updateData.siretNumber = siretNumber;

    const updatedSeller = await Seller.findOneAndUpdate(
      { userId: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedSeller) {
      return res.status(404).json({ message: "Boutique non trouvée pour cet utilisateur" });
    }

    return res.status(200).json({
      message: "Informations de la boutique mises à jour",
      seller: updatedSeller
    });
  } catch (error) {
    console.error("Erreur updateSellerInfos:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la mise à jour" });
  }
}

export { getSellerHome, getSellerInfos, createSeller, updateSellerInfos };
