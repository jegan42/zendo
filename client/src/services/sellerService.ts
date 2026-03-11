// =============================================================
// SERVICE SELLER - Gestion des requêtes liées à la boutique
// =============================================================

import api from "./api";

/**
 * Récupère les informations d'une boutique par l'ID de l'utilisateur
 */
const getShopInfos = async (userId: string) => {
    return api.get(`/seller/infos/${userId}`)
        .then((response) => response.data)
        .catch((err) => { throw err; });
};

/**
 * Crée une nouvelle boutique pour un utilisateur
 */
const createShop = async (userId: string, shopData: { shopName: string, siretNumber: string, shopLogo?: string }) => {
    return api.post(`/seller/create/${userId}`, shopData)
        .then((response) => response.data)
        .catch((err) => {
            console.error("Erreur création boutique:", err);
            throw err;
        });
};

/**
 * Met à jour les informations d'une boutique existante
 */
const updateShop = async (userId: string, shopData: any) => {
    return api.put(`/seller/update/${userId}`, shopData)
        .then((response) => response.data)
        .catch((err) => { throw err; });
};

export { getShopInfos, createShop, updateShop };