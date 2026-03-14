import "./Header.css";
import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faBell,
  faCartShopping,
  faCompass,
  faNavicon,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useParams, useLocation } from "react-router-dom";
import api from "../../services/api";
import { getCartCount } from "../../services/cartService";
// =============================================================
// La prop nbArticles est OPTIONNELLE.
// Si elle n'est pas fournie, le Header se débrouille tout seul :
// il appelle directement l'API /cart pour compter les articles.
// =============================================================
interface NbArticleProps {
  nbArticles?: number;
}

export function Header({ nbArticles }: NbArticleProps) {
  // Récupérer l'ID du produit depuis les paramètres de l'URL
  const { id: productId } = useParams();
  // Récupérer le chemin de la route actuelle
  const { pathname } = useLocation();
  // state pour stocker le titre du header
  const [headerTitle, setHeaderTitle] = useState("Zendo");

  // cartCount = nombre d'articles affiché dans le badge
  // Initialisé à la valeur de la prop si elle existe, sinon 0
  const [cartCount, setCartCount] = useState(nbArticles ?? 0);

  // fetchCartCount : délègue à cartService.getCartCount()
  // Plus de logique API ici, tout est centralisé dans le service.
  const fetchCartCount = useCallback(async () => {
    const total = await getCartCount();
    setCartCount(total);
  }, []);

  // Récupérer le titre selon la route
  useEffect(() => {
    if (pathname.includes("/produit") && productId) {
      api
        .get<{ product: { name?: string } }>(`/products/${productId}`)
        .then((res) => setHeaderTitle(res.data.product?.name ?? "Produit"))
        .catch(() => setHeaderTitle("Produit"));
      return;
    }

    const titles: Record<string, string> = {
      "/cart": "Panier",
      "/notifications": "Notifications",
      "/menu": "Menu",
      "/profil": "Profil",
      "/favoris": "Favoris",
    };

    setHeaderTitle(titles[pathname] ?? "Zendo");
  }, [pathname, productId]);

  // useEffect qui gère le compteur du badge :
  // - Si la prop nbArticles est fournie (ex: depuis App.tsx), on l'utilise directement.
  // - Sinon, on appelle fetchCartCount() pour récupérer le total depuis l'API.
  // Ce useEffect se relance à chaque changement de page (pathname) pour toujours
  // avoir un badge à jour quand l'utilisateur navigue.
  useEffect(() => {
    if (typeof nbArticles === "number") {
      setCartCount(nbArticles);
      return;
    }
    void fetchCartCount();
  }, [nbArticles, pathname, fetchCartCount]);

  // useEffect qui écoute l'événement global "cart:updated".
  // Cet événement est émis par la page Cart.tsx à chaque modification du panier
  // (ajout, suppression, changement de quantité, paiement).
  // Quand il est reçu, on re-fetch le compteur pour mettre à jour le badge.
  // Le return () => removeEventListener(...) est le "nettoyage" :
  // il retire l'écouteur quand le composant est démonté pour éviter les fuites mémoire.
  useEffect(() => {
    const handleCartUpdated = () => {
      void fetchCartCount();
    };

    window.addEventListener("cart:updated", handleCartUpdated);

    return () => {
      window.removeEventListener("cart:updated", handleCartUpdated);
    };
  }, [fetchCartCount]);

  // affiche le menu de gauche en fonction de la route actuelle
  const leftMenu = () => {
    if (pathname !== "/home" && pathname !== "/search") {
      return (
        <div className="header-menu">
          <Link to="/home">
            <FontAwesomeIcon icon={faAngleLeft} size="lg" color="#ffffff" />
          </Link>
        </div>
      );
    } else {
      return (
        <div className="header-menu">
          <Link to="/recherche">
            <FontAwesomeIcon icon={faNavicon} size="lg" color="#ffffff" />
          </Link>
        </div>
      );
    }
  };

  return (
    <header className="header">
      {leftMenu()}
      <div className="header-logo">
        <FontAwesomeIcon icon={faCompass} size="lg" color="#ffffff" />
        <Link to="/home" className="link">
          <h1 className="header-title">{headerTitle}</h1>
        </Link>
      </div>
      <div className="header-cart">
        <Link to="/notifications">
          <FontAwesomeIcon icon={faBell} size="lg" color="#ffffff" />
        </Link>
        <Link to="/cart">
          <div className="cart-icon-wrapper">
            <FontAwesomeIcon icon={faCartShopping} size="lg" color="#ffffff" />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
        </Link>
      </div>
    </header>
  );
}
