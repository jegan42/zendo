// =============================================================
// PAGE FAVORIS - Liste des produits ajoutes en favoris
// Affiche les produits sauvegardes par l'utilisateur
// avec possibilite d'ajouter au panier via modal
// =============================================================

import React from "react";
import "../styles/Pages.css";
import "../styles/Favoris.css";
import { useEffect, useState } from "react";
import { Header } from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import { Link } from "react-router-dom";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProductModal from "../components/Modal/ProductModal/ProductModal";
import { addToCart } from "../services/cartService";
import { removeFavori } from "../services/favoriService";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { Message } from "../components/Message/Message";
import api from "../services/api";

function Favoris() {
  // ETATS & HOOKS
  const [favoris, setFavoris] = useState<any[]>([]);
  const [error, setError] = useState("");
  // On stocke l'id du favori selectionne pour ouvrir le bon modal (un seul a la fois)
  const [selectedFavoriId, setSelectedFavoriId] = useState<string | null>(null);

  useEffect(function () {
    // Etape 1 : fetch les favoris de l'utilisateur
    api
      .get("/favoris", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      })
      .then(function (response) {
        const favorisList = response.data.favoris || [];

        // Etape 2 : pour chaque favori, fetch ses variations
        // On utilise Promise.all pour attendre que TOUS les fetch soient finis
        const variationsPromises = favorisList.map(function (favori: any) {
          return api
            .get("/products/" + favori._id)
            .then(function (prodResponse) {
              favori.variations = prodResponse.data.variations || [];
              return favori;
            })
            .catch(function () {
              favori.variations = [];
              return favori;
            });
        });

        // Etape 3 : une fois TOUS les fetch finis, on met a jour le state
        Promise.all(variationsPromises).then(function (favorisAvecVariations) {
          setFavoris(favorisAvecVariations);
        });
      });
  }, []);

  const favorisList = function () {
    return favoris.map(function (favori: any) {
      return (
        <div key={favori._id} className="favoris-item">
          <Link to={"/produit/" + favori._id} className="favoris-link">
            <img
              src={
                favori.images && favori.images[0]
                  ? favori.images[0]
                  : "/placeholder.png"
              }
              alt={favori.name}
              className="favoris-image"
            />
          </Link>
          <div className="favoris-info">
            <h3 className="favoris-title">{favori.name}</h3>
            <div className="favoris-bottom">
              <p className="favoris-price">{favori.price}€</p>
              <FontAwesomeIcon
                onClick={function () {
                  setSelectedFavoriId(favori._id);
                }}
                className="favoris-cart"
                icon={faCartShopping}
                size="lg"
                color="black"
              />
              <ProductModal
                isOpen={selectedFavoriId === favori._id}
                onClose={function () {
                  setSelectedFavoriId(null);
                }}
                onConfirm={function ({ color, size, quantity }: any) {
                  addToCart(favori._id, color, size, quantity).then(function (
                    message: string,
                  ) {
                    setError(message);
                  });
                }}
                title="Choisissez une variation"
                variations={favori.variations || []}
              />
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="page-container">
      <Header />
      <div className="page-content">
        <Message message={error} variant="error" />
        <div className="page-favoris">
          <div className="page-favoris-list">{favorisList()}</div>
          <ProductModal
            key={selectedProduct?._id}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onConfirm={({ color, size, quantity }: any) => {
              // j'appelle la fonction addToCart du service cartService pour ajouter le produit au panier de l'utilisateur
              // .then pour récupérer le message d'ajout au panier et l'afficher à l'utilisateur
              addToCart(selectedProduct._id, color, size, quantity).then(
                (message) => {
                  setError(message);
                },
              );
            }}
            title="Choisissez une variation"
            variations={selectedProduct?.variations || []}
          />
        </div>
      </div>
      <Navbar />
    </div>
  );
}

export default Favoris;
