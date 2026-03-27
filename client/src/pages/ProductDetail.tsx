// =============================================================
// PAGE PRODUCT DETAIL - Galerie style Zalando
// Layout : vignettes gauche | image principale | infos droite
// Les pastilles couleur switchent la galerie d'images
// =============================================================

import React, { useState, useEffect } from "react";
import Button from "../components/Button/Button";
import { Header } from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import "../styles/Pages.css";
import "../styles/ProductDetail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { Message } from "../components/Message/Message";
import { addToCart } from "../services/cartService";
import api from "../services/api";
import { updateCartItem, notifyCartUpdated } from "../services/cartService";

function ProductDetail() {
  // -- ETATS PRODUIT + VARIATIONS --
  const [product, setProduct] = useState<any>({
    images: [],
    name: "",
    price: 0,
    description: "",
    _id: "",
  });
  const [variations, setVariations] = useState<any[]>([]);

  // -- ETATS SELECTION UTILISATEUR --
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // -- ETATS FAVORIS --
  const [isFavori, setIsFavori] = useState(false);

  // -- ETATS UI --
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // -- PARAMS URL --
  const { id } = useParams();

  // =============================================================
  // CHARGEMENT DES DONNEES
  // =============================================================

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        // Recuperer le produit et ses variations
        const productResponse = await api.get(`/products/${id}`);
        setProduct(productResponse.data.product);
        setVariations(productResponse.data.variations || []);

        // Recuperer les favoris de l'utilisateur
        const favorisResponse = await api.get("/favoris");
        const favoris = favorisResponse.data.favoris || [];
        setIsFavori(favoris.some((favori: any) => favori._id === id));
      } catch (error) {
        console.error("Erreur fetch produit ou favoris:", error);
      }
    }

    fetchData();
  }, [id]);

  // =============================================================
  // LOGIQUE GALERIE D'IMAGES
  // =============================================================

  // Retourne la liste d'images a afficher dans la galerie
  // Si une couleur est selectionnee et que ses variations ont des images → ces images
  // Sinon → les images du produit
  // Fallback → tableau vide
  const getGalleryImages = () => {
    // Filtrer par couleur si une est selectionnee, sinon prendre toutes les variations
    const targetVariations = selectedColor
      ? variations.filter((v: any) => v.color === selectedColor)
      : variations;

    // Collecter toutes les images des variations ciblees (sans doublons)
    const allImages: string[] = [];
    for (let i = 0; i < targetVariations.length; i++) {
      const v = targetVariations[i];
      if (v.images && v.images.length > 0) {
        for (let j = 0; j < v.images.length; j++) {
          const img = v.images[j];
          if (img && img.trim() !== "" && !allImages.includes(img)) {
            allImages.push(img);
          }
        }
      }
    }

    if (allImages.length > 0) {
      return allImages;
    }

    // Fallback : images du produit (pour la home / vignette)
    if (product.images && product.images.length > 0) {
      return product.images;
    }

    return [];
  };

  // Retourne les pastilles couleur : une par couleur unique avec sa premiere image
  const getColorSwatches = () => {
    const seen: string[] = [];
    const swatches: { color: string; image: string }[] = [];

    for (let i = 0; i < variations.length; i++) {
      const v = variations[i];
      if (v.color && !seen.includes(v.color)) {
        seen.push(v.color);
        // Premiere image de cette variation comme miniature de la pastille
        const firstImage = v.images && v.images.length > 0 ? v.images[0] : "";
        swatches.push({
          color: v.color,
          image: firstImage,
        });
      }
    }

    return swatches;
  };

  // Retourne le prix a afficher
  // Si couleur + taille selectionnees → prix exact de cette variation
  // Sinon → "A partir de X EUR" (prix minimum des variations)
  // Fallback → prix du produit
  const getDisplayPrice = () => {
    // Prix exact si couleur + taille selectionnees
    if (selectedColor && selectedSize) {
      const match = variations.find(
        (v: any) => v.color === selectedColor && v.size === selectedSize,
      );
      if (match && match.price) {
        return match.price.toFixed(2) + " \u20AC";
      }
    }

    // Prix minimum des variations
    if (variations.length > 0) {
      const prices = variations
        .filter((v: any) => v.price && v.price > 0)
        .map((v: any) => v.price);

      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        // Si tous les prix sont identiques, pas besoin de "A partir de"
        if (minPrice === maxPrice) {
          return minPrice.toFixed(2) + " \u20AC";
        }
        return "A partir de " + minPrice.toFixed(2) + " \u20AC";
      }
    }

    // Fallback : prix du produit
    if (product.price) {
      return product.price.toFixed(2) + " \u20AC";
    }

    return "0.00 \u20AC";
  };

  // =============================================================
  // LOGIQUE COULEURS / TAILLES DISPONIBLES
  // =============================================================

  // Map des choix : { "Rouge" => ["S", "M"], "Bleu" => ["M", "L"] }
  const choix = new Map<string, string[]>();
  for (let i = 0; i < variations.length; i++) {
    const variation = variations[i];
    if (!choix.has(variation.color)) {
      choix.set(variation.color, []);
    }
    const existingSizes = choix.get(variation.color) || [];
    if (!existingSizes.includes(variation.size)) {
      existingSizes.push(variation.size);
      choix.set(variation.color, existingSizes);
    }
  }

  // Tailles disponibles pour la couleur selectionnee
  const sizes = [...new Set(variations.map((v) => v.size))];

  function sizeDisponible(size: string) {
    if (!selectedColor) return true;
    return choix.get(selectedColor)?.includes(size) || false;
  }

  // =============================================================
  // HANDLERS
  // =============================================================

  // Clic sur une pastille couleur → change la galerie
  const handleColorSwatchClick = (color: string) => {
    if (selectedColor === color) {
      // Deselectionner
      setSelectedColor("");
    } else {
      setSelectedColor(color);
    }
    setSelectedImageIndex(0);
  };

  // Clic sur une vignette → change l'image principale
  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  // Quantite
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

  // Favoris
  const handleFavoriClick = async () => {
    if (!id) return;

    const previousState = isFavori;
    const nextState = !isFavori;
    setIsFavori(nextState);

    try {
      let response;
      if (previousState) {
        response = await api.delete(`/favoris/${id}`);
      } else {
        response = await api.post(`/favoris/${id}`);
      }
      setError(response.data.message);
    } catch (err: any) {
      console.error("Erreur favoris:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la mise a jour des favoris",
      );
      setIsFavori(previousState);
    }
  };

  // Ajout au panier
  const handleAddCartClick = (
    color: string,
    size: string,
    quantity: number,
  ) => {
    if (!product?._id) return;

    addToCart(product._id, color, size, quantity).then((msg) => {
      setError(msg);
      notifyCartUpdated(); // prévient le Header que le panier a été mis à jour, pour que le badge se rafraîchisse
    });
  };

  // =============================================================
  // VARIABLES CALCULEES POUR LE RENDU
  // =============================================================

  const galleryImages = getGalleryImages();
  const colorSwatches = getColorSwatches();
  const displayPrice = getDisplayPrice();

  // Image principale actuellement affichee
  const currentMainImage =
    galleryImages.length > 0
      ? galleryImages[selectedImageIndex] || galleryImages[0]
      : "";

  return (
    <div className="page-container">
      <Header />

      <div className="page-content">
        <Message message={error} variant="error" />

        {/* ============================================= */}
        {/* GALERIE : vignettes | image principale | infos */}
        {/* ============================================= */}
        <div className="pd-gallery-layout">
          {/* -- Vignettes (thumbnails) -- */}
          <div className="pd-thumbnails">
            {galleryImages.map((img: string, index: number) => (
              <img
                key={index}
                src={img}
                alt={"Vignette " + (index + 1)}
                className={
                  "pd-thumbnail " +
                  (index === selectedImageIndex ? "pd-thumbnail-active" : "")
                }
                onClick={() => handleThumbnailClick(index)}
              />
            ))}
          </div>

          {/* -- Image principale -- */}
          <div className="pd-main-image-container">
            {currentMainImage ? (
              <img
                src={currentMainImage}
                alt={product.name || "Produit"}
                className="pd-main-image"
              />
            ) : (
              <div className="pd-no-image">Aucune image</div>
            )}

            {/* Icone coeur favori */}
            <FontAwesomeIcon
              icon={faHeart}
              onClick={handleFavoriClick}
              style={isFavori ? { color: "#E9BE59" } : {}}
              className="heart-icon"
            />
          </div>

          {/* -- Infos produit (colonne droite) -- */}
          <div className="pd-info">
            <h1 className="pd-product-name">{product.name || "Produit"}</h1>
            <p className="pd-product-price">{displayPrice}</p>

            {/* -- Pastilles couleur -- */}
            {colorSwatches.length > 0 && (
              <div className="pd-color-section">
                <p className="pd-section-label">Couleur</p>
                <div className="pd-color-swatches">
                  {colorSwatches.map((swatch) => (
                    <button
                      key={swatch.color}
                      className={
                        "pd-color-swatch " +
                        (selectedColor === swatch.color
                          ? "pd-color-swatch-active"
                          : "")
                      }
                      onClick={() => handleColorSwatchClick(swatch.color)}
                      title={swatch.color}
                    >
                      {swatch.image ? (
                        <img
                          src={swatch.image}
                          alt={swatch.color}
                          className="pd-swatch-image"
                        />
                      ) : (
                        <span className="pd-swatch-text">{swatch.color}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* -- Selection taille -- */}
            {sizes.length > 0 && (
              <div className="pd-size-section">
                <p className="pd-section-label">Taille</p>
                <select
                  className="pd-select"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  <option value="">-- Choisir une taille --</option>
                  {sizes.filter(sizeDisponible).map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* -- Quantite + Ajout panier -- */}
            <div className="pd-quantity-section">
              <p className="pd-section-label">Quantite</p>
              <div className="pd-quantity-row">
                <button
                  className="pd-quantity-btn"
                  onClick={handleDecreaseQuantity}
                >
                  -
                </button>
                <span className="pd-quantity-value">{selectedQuantity}</span>
                <button
                  className="pd-quantity-btn"
                  onClick={handleIncreaseQuantity}
                >
                  +
                </button>
              </div>

              <Button
                onClick={() =>
                  handleAddCartClick(
                    selectedColor,
                    selectedSize,
                    selectedQuantity,
                  )
                }
              >
                Ajouter au panier
              </Button>
            </div>

            {/* -- Description -- */}
            {product.description && (
              <div className="pd-description-section">
                <p className="pd-section-label">Description</p>
                <p className="pd-description-text">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Navbar />
    </div>
  );
}

export default ProductDetail;
