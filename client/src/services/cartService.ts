// =============================================================
// UTILITAIRE AJOUT AU PANIER
// Contient la fonction addToCart qui envoie une requete POST à l'API pour ajouter un produit au panier de l'utilisateur
// =============================================================

import api from "./api";

const addToCart = async (
    // je récupere l'id du produit et les choix de l'utilisateur (couleur, taille, quantité) pour les envoyer à l'API
    productId: string,
    color: string,
    size: string,
    quantity: number
) => {
    // j'envoie une requete POST à l'API pour ajouter le produit au panier de l'utilisateur
    return api
        .post(`/cart/${productId}`, {
            color,
            size,
            quantity,
        })
        .then((response) => response.data.message)
        .catch((err) => {
            console.error("Erreur ajout au panier:", err);
            throw err; // relance l'erreur pour la gestion ailleurs si besoin
        });
};

const updateCartItem = async (
    // je récupere l'id du produit, du cart item et les choix de l'utilisateur (couleur, taille, quantité) pour les envoyer à l'API
    productId: string,
    cartItemId: string,
    selectedQuantity: number
) => {
    // j'envoie une requete PATCH à l'API pour mettre à jour le produit dans le panier de l'utilisateur
    return api
        .patch(`/cart/${productId}/${cartItemId}`, {
            quantity: selectedQuantity,
        })
        .then((response) => response.data.message)
        .catch((err) => {
            console.error("Erreur mise à jour panier:", err);
            throw err; // relance l'erreur pour gestion ailleurs
        });
};

export { addToCart, updateCartItem };
