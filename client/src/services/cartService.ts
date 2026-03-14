// =============================================================
// SERVICE PANIER
// Regroupe toutes les fonctions liées au panier :
//   - addToCart       : ajouter un produit
//   - updateCartItem  : modifier la quantité d'un article
//   - getCartCount    : récupérer le nombre total d'articles
//   - notifyCartUpdated : prévenir le Header que le panier a changé
// =============================================================

import api from "./api";

const addToCart = async (
  // je récupere l'id du produit et les choix de l'utilisateur (couleur, taille, quantité) pour les envoyer à l'API
  productId: string,
  color: string,
  size: string,
  quantity: number,
) => {
  console.log("addToCart appelé avec:", { productId, color, size, quantity });
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
  selectedQuantity: number,
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

// =============================================================
// getCartCount
// Appelle l'API GET /cart et additionne toutes les quantités
// pour retourner le nombre total d'articles dans le panier.
// Utilisé par le Header pour afficher le badge.
// =============================================================
const getCartCount = async (): Promise<number> => {
  try {
    // j'envoie une requete GET à l'API pour récupérer le panier de l'utilisateur, puis je calcule le nombre total d'articles en additionnant les quantités
    const response = await api.get<{ cart: { quantity?: number }[] }>("/cart");
    // si la requete est réussie, je récupere le panier et j'additionne les quantités pour retourner le nombre total d'articles
    const cart = response.data?.cart ?? [];
    // je retourne la somme des quantités de tous les articles du panier
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  } catch (error) {
    console.error("Erreur chargement compteur panier:", error);
    return 0;
  }
};

// =============================================================
// notifyCartUpdated
// Émet un événement global "cart:updated" sur window.
// Le Header écoute cet événement pour savoir qu'il doit
// rappeler getCartCount() et rafraîchir le badge.
//
// À appeler après chaque action qui modifie le panier :
//   addToCart, updateCartItem, suppression, paiement...
// =============================================================
const notifyCartUpdated = () => {
  // j'émets un événement global "cart:updated" que le Header écoute pour rafraîchir le badge
  window.dispatchEvent(new Event("cart:updated"));
};

export { addToCart, updateCartItem, getCartCount, notifyCartUpdated };
