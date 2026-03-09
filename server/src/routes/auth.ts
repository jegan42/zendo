// =============================================================
// Ici c'est "l'aiguillage" :
// Si quelqu'un appelle POST /signup ça envoie vers la fonction signup du controller
// Juste un intermédiaire entre l'URL et la logique
// ROUTES AUTH - Definit les URLs pour l'authentification
// Quand le frontend appelle /api/auth/signup ou /api/auth/login
// =============================================================

import { Router } from "express";
import { signup, login, recovery, reset } from "../controllers/auth";
import { updateProfile } from "../controllers/user";

// On cree un "routeur" Express
const router = Router();

// Quand on recoit un POST sur /signup, on appelle la fonction signup du controller
router.post("/signup", signup);

// Quand on recoit un POST sur /login, on appelle la fonction login du controller
router.post("/login", login);

// Quand on recoit un POST sur /login, on appelle la fonction login du controller
router.post("/recovery", recovery);

// Quand on recoit un POST sur /login, on appelle la fonction login du controller
router.post("/reset", reset);

// Route : PUT /api/users/:id
router.put("/:id", updateProfile);

// On exporte le routeur pour l'utiliser dans index.ts
export default router;
