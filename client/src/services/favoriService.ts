// =============================================================
// UTILITAIRE FAVORIS
// Contient les fonctions pour gérer les favoris de l'utilisateur
// =============================================================

import api from "./api";

const removeFavori = async (
    // je récupere l'id du produit pour le supprimer des favoris de l'utilisateur
    productId: string
) => {
    // j'envoie une requete DELETE à l'API pour supprimer le produit des favoris de l'utilisateur
    return api
        .delete(`/favoris/${productId}`)
        .then((response) => response.data.message)
        .catch((err) => {
            console.error("Erreur suppression favori :", err);
            throw err; // pour gérer l'erreur là où la fonction est appelée
        });
};

const addFavori = async (
    // je récupere l'id du produit pour l'ajouter aux favoris de l'utilisateur
    productId: string
) => {
    // j'envoie une requete POST à l'API pour ajouter le produit aux favoris de l'utilisateur
    return api
        .post(`/favoris/${productId}`)
        .then((response) => response.data.message)
        .catch((err) => {
            console.error("Erreur ajout favori :", err);
            throw err; // pour gérer l'erreur à l'endroit où tu appelles la fonction
        });
};

export { removeFavori, addFavori };
