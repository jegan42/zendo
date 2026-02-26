import "./Header.css";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faBell,
  faCartShopping,
  faCompass,
  faNavicon,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useParams, useLocation } from "react-router-dom";

export function Header() {
  // Récupérer l'ID du produit depuis les paramètres de l'URL
  const { id: productId } = useParams();
  // Récupérer le chemin de la route actuelle
  const { pathname } = useLocation();
  // state pour stocker le titre du header
  const [headerTitle, setHeaderTitle] = useState("Zendo");

  // Récupérer le titre selon la route
  useEffect(() => {
    // met à jour le titre de l’en-tête en fonction de la route actuelle et du produit affiché
    if (pathname.includes("/produit") && productId) {
      fetch(`http://localhost:5001/api/products/${productId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.product && data.product.name) {
            setHeaderTitle(data.product.name);
          }
        })
        .catch((error) => {
          console.error("Erreur fetch produit:", error);
          setHeaderTitle("Produit");
        });
    } else if (pathname === "/cart") {
      setHeaderTitle("Panier");
    } else if (pathname === "/notifications") {
      setHeaderTitle("Notifications");
    } else if (pathname === "/menu") {
      setHeaderTitle("Menu");
    } else if (pathname === "/profil") {
      setHeaderTitle("Profil");
    } else if (pathname === "/favoris") {
      setHeaderTitle("Favoris");
    } else {
      setHeaderTitle("Zendo");
    }
    // exécute ce code chaque fois que pathname ou productId change
  }, [pathname, productId]);

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
          <FontAwesomeIcon icon={faCartShopping} size="lg" color="#ffffff" />
        </Link>
      </div>
    </header>
  );
}
