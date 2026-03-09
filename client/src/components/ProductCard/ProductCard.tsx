// =============================================================
// COMPOSANT PRODUCTCARD - Carte produit reutilisable
// Affiche l'image, le nom, le prix et un badge Made in France
// Utilisé sur Home dans les ProductRow
// =============================================================

import React from "react";
import "./ProductCard.css";

// Props du composant
interface ProductCardProps {
  product: any; // objet produit venant du backend
  onClick: (product: any) => void; // fonction appelée au clic
}

function ProductCard(props: ProductCardProps) {
  return (
    <div
      className="product-card"
      onClick={function () {
        props.onClick(props.product);
      }}
    >
      {/* Image du produit (premiere image du tableau) */}
      {props.product.images && props.product.images.length > 0 && (
        <img
          src={props.product.images[0]}
          alt={props.product.name}
          className="product-card-image"
        />
      )}
      <div className="product-card-info">
        <h3 className="product-card-name">{props.product.name}</h3>
        <p className="product-card-price">
          {props.product.variations && props.product.variations.length > 0
            ? Math.min(...props.product.variations.map((v: any) => v.price ?? 0)).toFixed(2)
            : "0.00"}{" "}
          EUR
        </p>
        {props.product.madeInFrance && (
          <span className="product-card-badge">Made in France</span>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
