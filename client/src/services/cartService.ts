// =============================================================
// UTILITAIRE AJOUT AU PANIER
// Contient la fonction addToCart qui envoie une requete POST à l'API pour ajouter un produit au panier de l'utilisateur
// =============================================================

const addToCart = (
  // je récupere l'id du produit et les choix de l'utilisateur (couleur, taille, quantité) pour les envoyer à l'API
  productId: string,
  color: string,
  size: string,
  quantity: number,
) => {
  // j'envoie une requete POST à l'API pour ajouter le produit au panier de l'utilisateur
  return fetch(`http://localhost:5001/api/cart/${productId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      color: color,
      size: size,
      quantity: quantity,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      return data.message;
    });
};

const updateCartItem = (
  // je récupere l'id du produit, du cart item et les choix de l'utilisateur (couleur, taille, quantité) pour les envoyer à l'API
  productId: string,
  cartItemId: string,
  selectedQuantity: number,
) => {
  // j'envoie une requete PUT à l'API pour mettre à jour le produit dans le panier de l'utilisateur
  return fetch(`http://localhost:5001/api/cart/${productId}/${cartItemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      quantity: selectedQuantity,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      return data.message;
    });
};

export { addToCart, updateCartItem };
