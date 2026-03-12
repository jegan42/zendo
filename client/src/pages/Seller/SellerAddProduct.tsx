// =============================================================
// PAGE SELLER ADD PRODUCT - Formulaire de creation de produit
// Le vendeur remplit les infos du produit + ajoute des variations
// (couleur, taille, prix, stock) avant de soumettre
// =============================================================

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import api from "../../services/api";
import "../../styles/Pages.css";
import "./SellerAddProduct.css";

// -- ENUMS : les memes que dans le model Product.ts --
const FAMILIES = [
  "Femme",
  "Homme",
  "Garcon",
  "Fille",
  "Bebe_fille",
  "Bebe_garcon",
  "Jouet",
  "Maison",
];

const CATEGORIES = [
  "Vetements",
  "Bijoux",
  "Chaussures",
  "Sacs",
  "Accessoires",
  "Sport",
  "Beaute",
  "Luminaire",
  "Tapis",
  "Decoration",
  "Art_de_la_table",
];

// -- TAILLES PREDEFINIES --
// Le vendeur clique sur une taille pour la selectionner (une seule a la fois)
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// -- TYPE POUR UNE LIGNE DE VARIATION --
// Une ligne = une taille + une couleur + un prix + un stock
// Chaque ligne correspond a exactement 1 variation en base
interface VariationForm {
  size: string;
  color: string;
  price: string;
  stock: string;
  images: string;
}

const SellerAddProduct = () => {
  // -- Navigation --
  const navigate = useNavigate();

  // -- Recuperer l'utilisateur connecte depuis Redux --
  const user = useSelector((state: any) => state.user.userInfo);

  // -- ETATS DU FORMULAIRE PRODUIT --
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [family, setFamily] = useState("");
  const [category, setCategory] = useState("");
  const [reference, setReference] = useState("");
  const [materials, setMaterials] = useState("");
  const [madeInFrance, setMadeInFrance] = useState(false);
  const [images, setImages] = useState("");

  // -- ETATS DES VARIATIONS --
  // On commence avec une ligne vide par defaut
  // Chaque ligne = 1 taille + 1 couleur + 1 prix + 1 stock
  // etat initial = tableau avec un objet vide
  const [variations, setVariations] = useState<VariationForm[]>([
    { size: "", color: "", price: "", stock: "", images: "" },
  ]);

  // -- ETATS UI --
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =============================================================
  // GESTION DES VARIATIONS
  // =============================================================

  // Ajouter une ligne de variation vide
  // on spread et ajoute nouvel objet
  const handleAddVariation = () => {
    setVariations([
      ...variations,
      { size: "", color: "", price: "", stock: "", images: "" },
    ]);
  };

  // Supprimer une variation par son index
  const handleRemoveVariation = (index: number) => {
    // On garde au moins 1 variation
    if (variations.length <= 1) return;

    const updated = variations.filter((_v, i) => i !== index);
    setVariations(updated);
  };

  // Modifier un champ texte/number d'une variation
  const handleVariationChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updated = variations.map((v, i) => {
      if (i === index) {
        return { ...v, [field]: value };
      }
      return v;
    });
    setVariations(updated);
  };

  // Selectionner une taille pour une variation (une seule a la fois)
  // Quand on change de taille, le stock est remis a zero
  // mais on conserve la couleur et le prix
  const handleSelectSize = (index: number, size: string) => {
    const updated = variations.map((v, i) => {
      if (i !== index) return v;

      // Si on clique sur la taille deja selectionnee, on la deselectionne
      if (v.size === size) {
        return { ...v, size: "", stock: "" };
      }

      // Sinon on selectionne la nouvelle taille et on reset le stock
      return { ...v, size: size, stock: "" };
    });
    setVariations(updated);
  };

  // =============================================================
  // SOUMISSION DU FORMULAIRE
  // =============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // -- Etape 1 : Validation des champs obligatoires --
    if (!name.trim()) {
      setError("Le nom du produit est obligatoire.");
      return;
    }
    if (!family) {
      setError("Veuillez choisir une famille.");
      return;
    }
    if (!category) {
      setError("Veuillez choisir une categorie.");
      return;
    }
    if (!reference.trim()) {
      setError("La reference produit est obligatoire.");
      return;
    }

    // Verifier qu'au moins une variation a une taille et un prix
    const hasValidVariation = variations.some(
      (v) => v.size && v.price && Number(v.price) > 0,
    );
    if (!hasValidVariation) {
      setError(
        "Ajoutez au moins une variation avec une taille selectionnee et un prix.",
      );
      return;
    }

    // -- Etape 2 : Preparation des donnees produit --
    const imagesArray = images.trim()
      ? images.split("\n").filter((url) => url.trim() !== "")
      : [];

    const materialsArray = materials.trim()
      ? materials
          .split(",")
          .map((m) => m.trim())
          .filter((m) => m !== "")
      : [];

    const productData = {
      name: name.trim(),
      description: description.trim(),
      family: family,
      category: category,
      reference: reference.trim(),
      material: materialsArray,
      madeInFrance: madeInFrance,
      images: imagesArray,
      sellerId: user.id,
    };

    try {
      setLoading(true);

      // -- Etape 3 : Creer le produit --
      const productResponse = await api.post("/products", productData);
      const productId = productResponse.data.product._id;

      // -- Etape 4 : Creer les variations --
      // Chaque ligne = 1 variation exacte (taille + couleur + prix + stock)
      const validVariations = variations.filter(
        (v) => v.size && v.price && Number(v.price) > 0,
      );

      for (let i = 0; i < validVariations.length; i++) {
        const v = validVariations[i];
        await api.post("/variations/products/" + productId + "/variations", {
          color: v.color.trim(),
          size: v.size,
          price: Number(v.price),
          stock: Number(v.stock) || 0,
          images: v.images.trim()
            ? v.images.split("\n").map((url) => url.trim()).filter((url) => url !== "")
            : [],
        });
      }

      // -- Etape 5 : Redirection vers le dashboard vendeur --
      navigate("/vendeur");
    } catch (err: any) {
      console.error("Erreur creation produit:", err);
      const message =
        err.response?.data?.message || "Erreur lors de la creation du produit.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // =============================================================
  // AFFICHAGE
  // =============================================================

  // Si pas connecte
  if (!user) {
    return (
      <div className="page-container">
        <p className="page-placeholder">
          Connectez-vous pour ajouter un produit.
        </p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* -- Bouton retour -- */}
      <div className="seller-add-header">
        <button
          className="seller-back-btn"
          onClick={() => navigate("/vendeur")}
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
          <span>Retour</span>
        </button>
        <h1 className="page-title">Ajouter un produit</h1>
      </div>

      {/* -- Message d'erreur -- */}
      {error && <p className="seller-add-error">{error}</p>}

      <form onSubmit={handleSubmit} className="seller-add-form">
        {/* ============================================= */}
        {/* SECTION 1 : INFORMATIONS DU PRODUIT           */}
        {/* ============================================= */}
        <div className="seller-add-card">
          <h2 className="seller-add-section-title">Informations du produit</h2>

          {/* Nom */}
          <div className="seller-add-field">
            <label className="seller-add-label">Nom du produit *</label>
            <input
              type="text"
              className="seller-add-input"
              placeholder="Ex : Robe en lin brodee"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="seller-add-field">
            <label className="seller-add-label">Description</label>
            <textarea
              className="seller-add-textarea"
              placeholder="Decrivez votre produit..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Famille + Categorie (cote a cote) */}
          <div className="seller-add-row">
            <div className="seller-add-field seller-add-half">
              <label className="seller-add-label">Famille *</label>
              <select
                className="seller-add-select"
                value={family}
                onChange={(e) => setFamily(e.target.value)}
              >
                <option value="">-- Choisir --</option>
                {FAMILIES.map((f) => (
                  <option key={f} value={f}>
                    {f.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="seller-add-field seller-add-half">
              <label className="seller-add-label">Categorie *</label>
              <select
                className="seller-add-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">-- Choisir --</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reference */}
          <div className="seller-add-field">
            <label className="seller-add-label">Reference produit *</label>
            <input
              type="text"
              className="seller-add-input"
              placeholder="Ex : ROBE-LIN-001"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          {/* Materiaux */}
          <div className="seller-add-field">
            <label className="seller-add-label">
              Materiaux (separes par des virgules)
            </label>
            <input
              type="text"
              className="seller-add-input"
              placeholder="Ex : Lin, Coton, Soie"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
            />
          </div>

          {/* Made in France */}
          <div className="seller-add-checkbox-row">
            <input
              type="checkbox"
              id="madeInFrance"
              checked={madeInFrance}
              onChange={(e) => setMadeInFrance(e.target.checked)}
            />
            <label htmlFor="madeInFrance" className="seller-add-checkbox-label">
              Fabrique en France
            </label>
          </div>

          {/* Images (URLs) */}
          <div className="seller-add-field">
            <label className="seller-add-label">
              Images (une URL par ligne)
            </label>
            <textarea
              className="seller-add-textarea"
              placeholder={
                "https://exemple.com/image1.jpg\nhttps://exemple.com/image2.jpg"
              }
              rows={3}
              value={images}
              onChange={(e) => setImages(e.target.value)}
            />
          </div>
        </div>

        {/* ============================================= */}
        {/* SECTION 2 : VARIATIONS                        */}
        {/* ============================================= */}
        <div className="seller-add-card">
          <div className="seller-add-section-header">
            <h2 className="seller-add-section-title">Variations</h2>
            <button
              type="button"
              className="seller-add-variation-btn"
              onClick={handleAddVariation}
            >
              <AddIcon sx={{ fontSize: 18 }} />
              <span>Ajouter</span>
            </button>
          </div>

          <p className="seller-add-hint">
            Choisissez une taille, puis remplissez la couleur, le prix et le
            stock pour cette variation.
          </p>

          {/* Liste des variations */}
          {variations.map((variation, index) => (
            <div key={index} className="seller-variation-row">
              {/* Ligne du haut : chips tailles (selection unique) + supprimer */}
              <div className="seller-variation-sizes">
                <span className="seller-variation-sizes-label">Taille :</span>
                <div className="seller-size-chips">
                  {SIZES.map((size) => {
                    const isSelected = variation.size === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        className={
                          "seller-size-chip " +
                          (isSelected ? "seller-size-chip-active" : "")
                        }
                        onClick={() => handleSelectSize(index, size)}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {/* Bouton supprimer (visible seulement s'il y a plus d'une variation) */}
                {variations.length > 1 && (
                  <button
                    type="button"
                    className="seller-variation-delete"
                    onClick={() => handleRemoveVariation(index)}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                  </button>
                )}
              </div>

              {/* Ligne du bas : couleur + prix + stock */}
              <div className="seller-variation-top">
                <input
                  type="text"
                  className="seller-add-input"
                  placeholder="Couleur (ex: Noir)"
                  value={variation.color}
                  onChange={(e) =>
                    handleVariationChange(index, "color", e.target.value)
                  }
                />
                <input
                  type="number"
                  className="seller-add-input"
                  placeholder="Prix (EUR) *"
                  min="0"
                  step="0.01"
                  value={variation.price}
                  onChange={(e) =>
                    handleVariationChange(index, "price", e.target.value)
                  }
                />
                <input
                  type="number"
                  className="seller-add-input"
                  placeholder="Stock"
                  min="0"
                  value={variation.stock}
                  onChange={(e) =>
                    handleVariationChange(index, "stock", e.target.value)
                  }
                />
              </div>

              {/* Images de la variation (une URL par ligne) */}
              <textarea
                className="seller-add-textarea"
                placeholder={"Images variation (une URL par ligne)"}
                rows={2}
                value={variation.images}
                onChange={(e) =>
                  handleVariationChange(index, "images", e.target.value)
                }
              />
            </div>
          ))}
        </div>

        {/* ============================================= */}
        {/* BOUTON SOUMETTRE                              */}
        {/* ============================================= */}
        <button type="submit" className="seller-submit-btn" disabled={loading}>
          {loading ? "Creation en cours..." : "Creer le produit"}
        </button>
      </form>
    </div>
  );
};

export default SellerAddProduct;
