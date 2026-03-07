// =============================================================
// UTILITAIRE ORDERS
// Contient les fonctions pour gérer les commandes de l'utilisateur
// =============================================================

const addOrder = (totalPrice: number) => {
  return fetch(`http://localhost:5001/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({ totalPrice }),
  })
    .then((response) => response.json())
    .then((data) => {
      return data.message;
    });
};

export { addOrder };
