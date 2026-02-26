// =============================================================
// COMPOSANT PRODUCT MODAL - Selection couleur/taille avant ajout panier
// S'ouvre quand on clique sur l'icone panier dans ProductView
// L'utilisateur choisit couleur + taille puis valide
// Plus tard les options viendront du backend (GET /product/variations)
// =============================================================

import React, { useState } from "react";
import Button from "../../Button/Button";
import "./ProductModal.css";

// Les props que le composant parent doit fournir
interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onConfirm doit être une fonction qui reçoit un objet avec les choix de l'utilisateur : { color: string, size: string }
  onConfirm: (selection: {
    color: string;
    size: string;
    quantity: number;
  }) => void;
  title: string;
  variations: any[];
}

function ProductModal(props: ProductModalProps) {
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  // set l'état pour stocker la quantité sélectionnée par l'utilisateur
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Si la modal est fermee, on n'affiche rien
  if (!props.isOpen) {
    return null;
  }

  // Quand l'utilisateur valide ses choix
  function handleValidation() {
    if (selectedColor && selectedSize) {
      props.onConfirm({
        color: selectedColor,
        size: selectedSize,
        quantity: selectedQuantity,
      });
      props.onClose();
    } else {
      alert("Veuillez choisir une couleur et une taille");
    }
  }

  // Pour chaque variation du produit, on recupere les couleurs et les tailles disponibles pour les afficher dans la modal
  // On utilise un Set pour ne pas avoir de doublons dans les listes de couleurs et tailles
  const colors = [
    ...new Set(props.variations.map((variation) => variation.color)),
  ];
  const sizes = [
    ...new Set(props.variations.map((variation) => variation.size)),
  ];

  const choix = new Map<string, string[]>();
  // je parcours les variations du produit pour construire une map des choix possibles : { "Rouge" => ["S", "M"], "Bleu" => ["M", "L"] }
  for (let i = 0; i < props.variations.length; i++) {
    const variation = props.variations[i];
    // si la couleur n'est pas encore dans la map, je l'ajoute avec une liste de tailles vide
    if (!choix.has(variation.color)) {
      choix.set(variation.color, []);
    }
    // j'ajoute la taille de la variation à la liste des tailles disponibles pour cette couleur
    const existingSizes = choix.get(variation.color) || [];
    // je vérifie que la taille n'est pas déjà dans la liste avant de l'ajouter
    if (!existingSizes.includes(variation.size)) {
      existingSizes.push(variation.size);
      choix.set(variation.color, existingSizes);
    }
  }

  // fonction pour vérifier si une taille est disponible pour la couleur sélectionnée
  function sizeDisponible(size: string) {
    // si aucune couleur n'est sélectionnée, toutes les tailles sont disponibles
    if (!selectedColor) {
      return true;
    }
    // je vérifie dans la map des choix si la taille est disponible pour la couleur sélectionnée
    for (let i = 0; i < props.variations.length; i++) {
      const variation = props.variations[i];
      // si la variation correspond à la couleur et à la taille, alors cette taille est disponible pour cette couleur
      if (variation.color === selectedColor && variation.size === size) {
        return true;
      }
    }
    return false;
  }

  const handleIncreaseQuantity = () => {
    if (selectedQuantity < 10) {
      setSelectedQuantity(selectedQuantity + 1);
    }
  };
  const handleDecreaseQuantity = () => {
    if (selectedQuantity > 1) {
      setSelectedQuantity(selectedQuantity - 1);
    }
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{props.title}</h2>
        <p>Selectionnez vos options :</p>

        {/* Section Couleurs */}
        <div className="option-group">
          <label>Couleur :</label>
          <div className="options">
            {colors.map(function (color) {
              return (
                <button
                  key={color}
                  className={selectedColor === color ? "active" : ""}
                  onClick={function () {
                    setSelectedColor(color);
                  }}
                  disabled={
                    selectedSize !== "" &&
                    !choix.get(color)?.includes(selectedSize)
                  } /* Si une taille est déjà sélectionnée et que cette couleur ne propose pas cette taille, on disable le bouton */
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Tailles */}
        <div className="option-group">
          <label>Taille :</label>
          <div className="options">
            {sizes.map(function (size) {
              return (
                <button
                  key={size}
                  className={selectedSize === size ? "active" : ""}
                  onClick={() => setSelectedSize(size)}
                  disabled={!sizeDisponible(size)}
                >
                  {size}
                </button>
              );
            })}
            {/* Section Quantité*/}
            <div className="option-group">
              <label>Quantité :</label>
              <div className="quantity-selector">
                <button type="button" onClick={handleDecreaseQuantity}>
                  -
                </button>
                <span className="quantity-value">{selectedQuantity}</span>
                <button type="button" onClick={handleIncreaseQuantity}>
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons Annuler / Ajouter */}
        <div className="modal-actions">
          <Button variant="secondary" onClick={props.onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleValidation}>
            Ajouter au panier
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
