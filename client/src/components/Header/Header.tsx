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
import api from "../../services/api";

export function Header() {
    // Récupérer l'ID du produit depuis les paramètres de l'URL
    const { id: productId } = useParams();
    // Récupérer le chemin de la route actuelle
    const { pathname } = useLocation();
    // state pour stocker le titre du header
    const [headerTitle, setHeaderTitle] = useState("Zendo");

    // Récupérer le titre selon la route
    useEffect(() => {
        if (pathname.includes("/produit") && productId) {
            api.get<{ product: { name?: string } }>(`/products/${productId}`)
                .then((res) =>
                    setHeaderTitle(res.data.product?.name ?? "Produit")
                )
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

    // affiche le menu de gauche en fonction de la route actuelle
    const leftMenu = () => {
        if (pathname !== "/home" && pathname !== "/search") {
            return (
                <div className="header-menu">
                    <Link to="/home">
                        <FontAwesomeIcon
                            icon={faAngleLeft}
                            size="lg"
                            color="#ffffff"
                        />
                    </Link>
                </div>
            );
        } else {
            return (
                <div className="header-menu">
                    <Link to="/recherche">
                        <FontAwesomeIcon
                            icon={faNavicon}
                            size="lg"
                            color="#ffffff"
                        />
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
                    <FontAwesomeIcon
                        icon={faCartShopping}
                        size="lg"
                        color="#ffffff"
                    />
                </Link>
            </div>
        </header>
    );
}
