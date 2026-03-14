// =============================================================
// UTILITAIRE ORDERS
// Contient les fonctions pour gérer les commandes de l'utilisateur
// =============================================================

import api from "./api";

const addOrder = async (totalPrice: number): Promise<any> => {
  try {
    const response = await api.post("/orders", { totalPrice });
    return response.data;
  } catch (err: any) {
    console.error("Erreur lors de la création de la commande :", err);
    throw err; // pour gérer l'erreur à l'appel de la fonction
  }
};

export { addOrder };
