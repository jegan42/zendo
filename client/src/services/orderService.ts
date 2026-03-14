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

const getUserOrders = async (): Promise<any[]> => {
    try {
        const response = await api.get("/orders/my-orders");
        
        // Retourne le tableau formaté par le backend : 
        // [{ orderNumber, totalAmount, status, shopNames, createdAt }, ...]
        return response.data;
    } catch (err: any) {
        console.error("Erreur lors de la récupération de la liste des commandes :", err);
        throw err;
    }
};

//récupérer les produits des commandes
const getRecentProducts = async (): Promise<any[]> => {
    try {
        const response = await api.get("/orders/recent-products");
        // On retourne les données formatées par le backend
        return response.data; 
    } catch (err: any) {
        console.error("Erreur lors de la récupération des produits récents :", err);
        throw err;
    }
};

export { addOrder, getUserOrders, getRecentProducts};
