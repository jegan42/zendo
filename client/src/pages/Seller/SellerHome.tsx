// =============================================================
// PAGE SELLER HOME - Dashboard du vendeur
// = liste produits + stats
// Plus tard : bouton ajouter produit, gestion commandes, CA
// =============================================================

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import StorefrontIcon from "@mui/icons-material/Storefront";
import InventoryIcon from "@mui/icons-material/Inventory";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import "../../styles/Pages.css";
import "./SellerHome.css";

function SellerHome() {
  // -- ETATS --
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    totalStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // On recupere le user connecte depuis Redux
  const user = useSelector(function (state: any) {
    return state.user.userInfo;
  });

  const navigate = useNavigate();

  useEffect(
    function () {
      if (!user) {
        setLoading(false);
        return;
      }

      fetchSellerData();
    },
    [user],
  );

  // récupération des données du Dash Seller
  async function fetchSellerData() {
    try {
      setLoading(true);
      setError("");

      // Appel API : GET /api/seller/:userId
      const response = await axios.get(
        "http://localhost:5001/api/seller/" + user._id,
      );

      // On met a jour les etats avec les donnees recues
      setProducts(response.data.products);
      setStats(response.data.stats);
    } catch (err: any) {
      console.error("Erreur chargement dashboard vendeur:", err);
      setError("Impossible de charger vos produits");
    } finally {
      setLoading(false);
    }
  }

  // -- CALCUL DU PRIX MIN/MAX POUR CHAQUE PRODUIT --
  // Un produit a plusieurs variations avec des prix differents
  // donc "X EUR - Y EUR" ou juste "X EUR" si un seul prix
  function getPriceRange(variations: any[]) {
    if (!variations || variations.length === 0) {
      return "Pas de prix";
    }

    const prices = variations.map(function (v) {
      return v.price;
    });

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return minPrice + " EUR";
    }

    return minPrice + " - " + maxPrice + " EUR";
  }

  // -- CALCUL DU STOCK TOTAL D'UN PRODUIT --
  function getTotalStock(variations: any[]) {
    if (!variations || variations.length === 0) {
      return 0;
    }

    return variations.reduce(function (sum, v) {
      return sum + (v.stock || 0);
    }, 0);
  }

  // -- AFFICHAGE SI PAS CONNECTE --
  if (!user) {
    return (
      <div className="page-container">
        <p className="page-placeholder">
          Connectez-vous pour acceder a votre espace vendeur.
        </p>
      </div>
    );
  }

  // -- AFFICHAGE CHARGEMENT --
  if (loading) {
    return (
      <div className="page-container">
        <p className="page-placeholder">Chargement de votre boutique...</p>
      </div>
    );
  }

  // -- AFFICHAGE ERREUR --
  if (error) {
    return (
      <div className="page-container">
        <p className="seller-error">{error}</p>
        <button className="seller-retry-btn" onClick={fetchSellerData}>
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* -- EN-TETE VENDEUR -- */}
      <div className="seller-header">
        <StorefrontIcon sx={{ fontSize: 28, color: "#3b5998" }} />
        <h1 className="page-title">Ma boutique</h1>
      </div>

      {/* -- CARTES STATISTIQUES -- */}
      <div className="seller-stats-row">
        {/* Carte : total produits */}
        <div className="stat-card">
          <InventoryIcon className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">{stats.totalProducts}</span>
            <span className="stat-label">Produits</span>
          </div>
        </div>

        {/* Carte : produits actifs */}
        <div className="stat-card">
          <CheckCircleOutlineIcon className="stat-icon stat-icon-active" />
          <div className="stat-info">
            <span className="stat-number">{stats.activeProducts}</span>
            <span className="stat-label">Actifs</span>
          </div>
        </div>

        {/* Carte : produits inactifs */}
        <div className="stat-card">
          <RemoveCircleOutlineIcon className="stat-icon stat-icon-inactive" />
          <div className="stat-info">
            <span className="stat-number">{stats.inactiveProducts}</span>
            <span className="stat-label">Inactifs</span>
          </div>
        </div>
      </div>

      {/* -- SECTION LISTE DES PRODUITS -- */}
      <div className="seller-products-section">
        <div className="seller-products-header">
          <h2 className="seller-section-title">Mes produits</h2>
          <button className="seller-add-btn">
            <AddIcon sx={{ fontSize: 20 }} />
            <span>Ajouter</span>
          </button>
        </div>

        {/* Liste des produits */}
        {products.length === 0 ? (
          <div className="seller-empty">
            <p>Vous n'avez pas encore de produits.</p>
            <p>Commencez par en ajouter un !</p>
          </div>
        ) : (
          <div className="seller-product-list">
            {products.map(function (product) {
              return (
                <div key={product._id} className="seller-product-card">
                  {/* Image du produit */}
                  <div className="seller-product-img-wrapper">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="seller-product-img"
                      />
                    ) : (
                      <div className="seller-product-no-img">
                        <InventoryIcon sx={{ fontSize: 32, color: "#ccc" }} />
                      </div>
                    )}
                    {/* Badge statut */}
                    <span
                      className={
                        "seller-status-badge " +
                        (product.status ? "badge-active" : "badge-inactive")
                      }
                    >
                      {product.status ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  {/* Infos du produit */}
                  <div className="seller-product-info">
                    <h3 className="seller-product-name">{product.name}</h3>
                    <p className="seller-product-price">
                      {getPriceRange(product.variations)}
                    </p>
                    <p className="seller-product-stock">
                      Stock : {getTotalStock(product.variations)}
                    </p>
                    <p className="seller-product-category">
                      {product.family} - {product.category}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerHome;
