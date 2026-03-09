// =============================================================
// INDEX.TS - Point d'entree backend
// C'est ce fichier qui demarre Express et connecte MongoDB
// On lance via : npm run dev
// =============================================================

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import indexRoutes from "./routes/index";

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
app.use("/api", indexRoutes);

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
