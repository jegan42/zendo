// =============================================================
// COMPOSANT PRODUCT VIEW - Carte produit avec actions
// Affiche : image, titre, prix, description tronquee
// Actions : bouton favori (coeur) + bouton panier (ouvre modal)
// Utilise dans la page ProductList
// =============================================================

import React, { useState } from "react";
import { FavoriteBorder, Favorite, AddShoppingCart } from "@mui/icons-material";
import ProductModal from "../Modal/ProductModal/ProductModal";
import "./ProductView.css";

// Les props que le composant parent doit fournir
interface ProductViewProps {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  variations?: any[];
}

function ProductView(props: ProductViewProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Limiter la description a 100 caracteres
  function truncateDescription(text: string) {
    if (text.length > 100) {
      return text.substring(0, 100) + "...";
    }
    return text;
  }

  // Fonction appelee depuis la Modal quand l'utilisateur valide ses choix
  function handleAddToCart(selection: {
    color: string;
    size: string;
    quantity: number;
  }) {
    console.log(
      "Produit ajoute : " +
        props.title +
        ", Couleur: " +
        selection.color +
        ", Taille: " +
        selection.size +
        ", Quantité: " +
        selection.quantity,
    );
  }

  return (
    <div className="product-card">
      {/* Image du produit */}
      <img src={props.image} alt={props.title} className="product-image" />

      <div className="product-info">
        {/* Premiere ligne : Titre et icones */}
        <div className="product-header">
          <h3 className="product-title">{props.title}</h3>
          <div className="product-actions">
            {/* Toggle Favoris */}
            <button
              onClick={function () {
                setIsFavorite(!isFavorite);
              }}
              className="icon-btn"
            >
              {isFavorite ? (
                <Favorite sx={{ color: "#eed7b8" }} />
              ) : (
                <FavoriteBorder />
              )}
            </button>

            {/* Ouvre la Modal pour choisir les variantes */}
            <button
              onClick={function () {
                setIsModalOpen(true);
              }}
              className="icon-btn"
            >
              <AddShoppingCart />
            </button>
          </div>
        </div>

        {/* Prix */}
        <p className="product-price">{props.price.toFixed(2)} EUR</p>

        {/* Description tronquee */}
        <p className="product-description">
          {truncateDescription(props.description)}
        </p>

        {/* Modal de selection couleur/taille */}
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleAddToCart}
          title={props.title}
          variations={props.variations || []}
        />
      </div>
    </div>
  );
}

export default ProductView;
