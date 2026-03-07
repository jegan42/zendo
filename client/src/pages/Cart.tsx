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
import { updateCartItem } from "../services/cartService";
import { addOrder } from "../services/oderService";

function Cart() {
  // ETATS & HOOKS
  const [cart, setCart] = useState<any[]>([]);

  const [error, setError] = useState("");

  useEffect(() => {
    // fetch les produits du panier de l'utilisateur
    fetch(`http://localhost:5001/api/cart`, {
      method: "GET",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then((response) => response.json())
      .then((data) => {
        const cart = data.cart || [];
        setCart(cart);

        // charger les données de chaque produit
        for (let i = 0; i < cart.length; i++) {
          fetch(`http://localhost:5001/api/products/${cart[i].product}`, {
            method: "GET",
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          })
            .then((response) => response.json())
            .then((productData) => {
              cart[i].productData = productData.product;
              // mettre à jour le panier avec les données du produit
              setCart([...cart]);
            });
        }
        console.log(cart);
      });
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
      updateCartItem(item.product, item._id, item.quantity);
    }
  };
  // fonctions pour diminuer la quantité d'un produit dans le panier de l'utilisateur
  const handleDecreaseQuantity = (item: any) => {
    if (item.quantity > 1) {
      item.quantity -= 1;
      setCart([...cart]);
      updateCartItem(item.product, item._id, item.quantity);
    }
  };
  const handleDeleteClick = (item: any) => {
    // supprimer le produit du panier de l'utilisateur
    setCart((prevCart) =>
      // filtrer le panier pour supprimer le produit correspondant
      prevCart.filter((cartItem) => cartItem._id !== item._id),
    );

    fetch(`http://localhost:5001/api/cart/${item.product}/${item._id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      // mettre a jour le panier apres suppression du produit
      .then((response) => response.json())
      .catch(() => {});
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
