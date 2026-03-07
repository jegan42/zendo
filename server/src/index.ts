// =============================================================
// INDEX.TS - Point d'entree backend
// C'est ce fichier qui demarre Express et connecte MongoDB
// On lance via : npm run dev
// =============================================================

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/product";
import variationRoutes from "./routes/variation";

import favorisRoutes from "./routes/favoris";
import cartRoutes from "./routes/cart";
import sellerRoutes from "./routes/seller";
import userRoutes from "./routes/user";
import addressRoutes from "./routes/address";
import orderRoutes from "./routes/order";

// Charge depuis le .env
// (MONGO_URI, JWT_SECRET, PORT)
dotenv.config();

// On créer Express
const app = express();

// Recupere le port depuis .env, sinon 5000
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARES ---
// Fonctions qui s'executent avant requete

// cors() : pour que le front communique avec le back
app.use(cors());

// express.json() : permet de lire le JSON envoyé dans le body des requetes POST
app.use(express.json());

// --- ROUTES ---

// Toutes les routes qui commencent par /api/auth sont gerées par authRoutes
// Exemple : POST /api/auth/signup, POST /api/auth/login
//
app.use("/api/auth", authRoutes);

// Routes produits : GET /api/products, GET /api/products/:id, POST, DELETE
app.use("/api/products", productRoutes);

// Routes variations : GET /api/variations, GET /api/variations/:id
app.use("/api/variations", variationRoutes);

// Routes favoris : GET/POST/DELETE /api/favoris/...
app.use("/api/favoris", favorisRoutes);

// Routes cart : GET/POST/DELETE /api/cart/...
app.use("/api/cart", cartRoutes);

// Routes seller : GET /api/seller/:id (dashboard vendeur)
app.use("/api/seller", sellerRoutes);

// Routes user : PUT /api/users/:id (update profil)
app.use("/api/users", userRoutes);

// Routes address : POST /api/address/save/:userId (sauvegarder adresse)
app.use("/api/address", addressRoutes);

// Routes orders : POST /api/orders/create (creer une commande)
app.use("/api/orders", orderRoutes);

// Route de test pour verifier que le serveur fonctionne
// http://localhost:5000
app.get("/", function (req, res) {
  res.json({ message: "API Zendo fonctionne" });
});

// --- CONNEXION A MONGODB ---
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(function () {
    console.log("Connecte a MongoDB");

    // Si connecté a MongoDB, on demarre Express
    app.listen(PORT, function () {
      console.log("Serveur demarre sur http://localhost:" + PORT);
    });
  })
  .catch(function (error) {
    // Si connexion fail, erreur :
    console.error("Erreur de connexion MongoDB:", error);
  });
