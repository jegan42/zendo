// =============================================================
// PAGE CART - Liste des produits ajoutes au panier
// Pour l'instant c'est un placeholder (page vide)
// Plus tard on affichera les produits sauvegardes par l'utilisateur
// =============================================================

import React from "react";
import "../styles/Pages.css";
import "../styles/Cart.css";
import { useEffect, useState } from "react";
import { Header } from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import { Message } from "../components/Message/Message";
import Button from "../components/Button/Button";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { updateCartItem, notifyCartUpdated } from "../services/cartService";
import { addOrder } from "../services/orderService";
import api from "../services/api";

function Cart() {
  // ETATS & HOOKS
  const [cart, setCart] = useState<any[]>([]);

  const [error, setError] = useState("");

  // notifyCartUpdated est importé depuis cartService.ts.
  // Il émet l'événement "cart:updated" que le Header écoute pour rafraîchir le badge.
  // Toute page qui modifie le panier peut l'importer et l'appeler de la même façon.

  useEffect(() => {
    async function loadCart() {
      try {
        // récupérer le panier
        const cartResponse = await api.get<{ cart: any[] }>("/cart");

        const cart = cartResponse.data?.cart ?? [];

        // récupérer les produits du panier
        const products = await Promise.all(
          cart.map(async (item: any) => {
            const productRes = await api.get(`/products/${item.product}`);

            return {
              ...item,
              productData: productRes.data.product,
            };
          }),
        );

        setCart(products);
        // On notifie le Header que le panier vient d'être chargé,
        // pour que le badge affiche le bon nombre dès l'ouverture de la page.
        notifyCartUpdated();
      } catch (error) {
        console.error("Erreur chargement panier:", error);
      }
    }

    loadCart();
  }, []);

  // fonction pour afficher la liste des produits du panier de l'utilisateur
  const cartList = () => {
    return cart.map((item: any) => (
      <div key={item._id} className="product-item">
        <Link to={`/produit/${item.product}`} className="product-link">
          <img
            src={item.productData?.images?.[0] || "/placeholder.png"}
            alt={item.productData?.name}
            className="product-image"
          />
        </Link>
        <div className="product-info">
          <div>
            <h3 className="product-title">{item.productData?.name}</h3>
            <p className="product-price">{item.productData?.price}€</p>
          </div>
          <div className="product-bottom">
            <div className="product-variations-info">
              <span className="product-color">Couleur : {item.color}</span>
              <div className="product-quantity-controls">
                <button onClick={() => handleDecreaseQuantity(item)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => handleIncreaseQuantity(item)}>+</button>
              </div>
            </div>
            <div className="product-size-delete">
              <p className="product-size">Taille : {item.size}</p>
              <FontAwesomeIcon
                icon={faTrash}
                onClick={() => handleDeleteClick(item)}
                className="trash-icon"
              />
            </div>
          </div>
        </div>
      </div>
    ));
  };

  // fonctions pour augmenter la quantité d'un produit dans le panier de l'utilisateur
  const handleIncreaseQuantity = (item: any) => {
    if (item.quantity < 10) {
      item.quantity += 1;
      setCart([...cart]);
      updateCartItem(item.product, item._id, item.quantity)
        .then(() => {
          // Quantité modifiée côté API → on met à jour le badge du Header
          notifyCartUpdated();
        })
        .catch((err) => console.error("Erreur mise à jour panier:", err));
    }
  };
  // fonctions pour diminuer la quantité d'un produit dans le panier de l'utilisateur
  const handleDecreaseQuantity = (item: any) => {
    if (item.quantity > 1) {
      item.quantity -= 1;
      setCart([...cart]);
      updateCartItem(item.product, item._id, item.quantity)
        .then(() => {
          // Quantité modifiée côté API → on met à jour le badge du Header
          notifyCartUpdated();
        })
        .catch((err) => console.error("Erreur mise à jour panier:", err));
    }
  };
  const handleDeleteClick = (item: any) => {
    // supprimer le produit du panier de l'utilisateur
    const removeFromCart = async (item: any) => {
      try {
        await api.delete(`/cart/${item.product}/${item._id}`);

        const updatedCart = cart.filter((p) => p._id !== item._id);
        setCart(updatedCart);
        // Article supprimé → on prévient le Header de recalculer le badge
        notifyCartUpdated();
      } catch (error) {
        console.error("Erreur suppression produit:", error);
      }
    };
    removeFromCart(item);
  };

  const totalPrice = cart.reduce(
    (total, item) =>
      total + (item.productData?.price || 0) * (item.quantity || 0),
    0,
  );

  const handlePaymentClick = () => {
    addOrder(totalPrice).then((message) => {
      if (message === "Commande créée avec succès") {
        setCart([]);
        // Panier vidé après paiement → badge remis à 0 dans le Header
        notifyCartUpdated();
        window.location.href = "/paiement";
      }
    });
  };

  return (
    <div className="page-container">
      <Header />
      <div className="page-content">
        <Message message={error} variant="error" />
        <div className="page-cart">
          <div className="page-cart-list">{cartList()}</div>
        </div>
        <p className="cart-total">Total : {totalPrice}€</p>
        <Button onClick={handlePaymentClick}>Paiement</Button>
      </div>
      <Navbar />
    </div>
  );
}

export default Cart;
