// =============================================================
// MODELE PRODUCT - Represente un produit dans la base de donnees
// Chaque produit appartient a un vendeur et a une categorie
// IMG = Url ...reste la question du stockage + SEED (rofl)...
// =============================================================

import mongoose from "mongoose";

// --- ENUMS ---
// Les valeurs possibles pour certains champs
// Ca empeche de mettre n'importe quoi dans la base

// Familles de produits (qui porte/utilise le produit)
const FAMILIES = [
  "Femme",
  "Homme",
  "Garcon",
  "Fille",
  "Bebe_fille",
  "Bebe_garcon",
  "Jouet",
  "Maison",
];

// Categories de produits (type de produit)
const CATEGORIES = [
  "Vetements",
  "Bijoux",
  "Chaussures",
  "Sacs",
  "Accessoires",
  "Sport",
  "Beaute",
  "Luminaire",
  "Tapis",
  "Decoration",
  "Art_de_la_table",
];

const ProductSchema = new mongoose.Schema(
  {
    // Nom du produit
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Description du produit
    description: {
      type: String,
      default: "",
    },

    // Images du produit : tableau d'URLs
    // Exemple : ["https://exemple.com/img1.jpg", "https://exemple.com/img2.jpg"]

    images: {
      type: [String],
      default: [],
    },

    // !!!JC!!! pas ici mais pour variation
    // Prix du produit en euros
    // Plus tard ce prix pourra etre dans un modele Variation (couleur/taille)
    // price: {
    //   type: Number,
    //   required: true,
    // },

    // Famille du produit (Femme, Homme, Enfant, Maison...)
    family: {
      type: String,
      enum: FAMILIES,
      required: true,
    },

    // Categorie du produit (Vetements, Bijoux, Chaussures...)
    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
    },

    // Materiaux utilises (tableau car un produit peut avoir plusieurs materiaux)
    material: {
      type: [String],
      default: [],
    },

    madeInFrance: {
      type: Boolean,
      default: false,
    },

    // Reference produit (code vendeur)
    reference: {
      type: String,
      // default: "", // !!!JC!!! pas de valeur par defaut, le vendeur doit la renseigner
      required: true, // !!!JC!!! la reference est obligatoire pour identifier le produit
      // !!!JC!!! Plus tard on pourra ajouter un index unique sur (sellerId + reference) pour garantir que chaque vendeur a des references uniques
    },

    // Statut du produit : actif (visible) ou inactif (cache)
    status: {
      type: Boolean, // !!!JC!!! boolean car une string "active"/"inactive" ca prend plus de place et c'est plus compliqué a manipuler que true/false
      // enum: ["active", "inactive"],
      default: true, // !!!JC!!! par defaut le produit est actif, le vendeur doit le desactiver s'il ne veut pas le vendre
    },

    // ID du vendeur qui a cree ce produit
    // Plus tard on liera ca au modele Seller
    // Pour l'instant on stocke juste l'ID du User qui vend
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // !!!JC!!! le vendeur est obligatoire pour savoir a qui appartient le produit
    },
  },
  {
    // Ajoute automatiquement createdAt et updatedAt
    timestamps: true,
    // Necessaire pour que les virtuals (ex: variations) apparaissent dans res.json()
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// --- VIRTUAL POPULATE ---
// Création du lien avec la collection Variation
ProductSchema.virtual("variations", {
  ref: "Variation", // Nom du modèle cible
  localField: "_id", // Clé ici (Product)
  foreignField: "productId", // Clé dans la collection cible (Variation)
});

const Product = mongoose.model("Product", ProductSchema);

export default Product;
