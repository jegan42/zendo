// =============================================================
// COMPOSANT NAVBAR - Barre de navigation en bas de l'ecran
// Affiche les liens : Accueil, Recherche, Favoris, Profil, Boutique
// Icones MUI pour le visuel
// =============================================================

import React from "react";
import { NavLink } from "react-router-dom";
import {
    Home,
    Search,
    Favorite,
    Person,
    Storefront,
} from "@mui/icons-material";
import "./Navbar.css";
import { useSelector } from "react-redux";

function Navbar() {
    const { userInfo: user } = useSelector((state: any) => state.user);
    return (
        <nav className="navbar">
            <NavLink to="/home" className="navbar-item">
                <Home className="navbar-icon" />
                <span className="navbar-label">Accueil</span>
            </NavLink>

            <NavLink to="/recherche" className="navbar-item">
                <Search className="navbar-icon" />
                <span className="navbar-label">Recherche</span>
            </NavLink>

            <NavLink to="/favoris" className="navbar-item">
                <Favorite className="navbar-icon" />
                <span className="navbar-label">Favoris</span>
            </NavLink>

            <NavLink to="/profil" className="navbar-item">
                <Person className="navbar-icon" />
                <span className="navbar-label">Profil</span>
            </NavLink>

            {user?.role?.includes('seller') && <NavLink to="/vendeur" className="navbar-item">
                <Storefront className="navbar-icon" />
                <span className="navbar-label">Boutique</span>
            </NavLink>}
        </nav>
    );
}

export default Navbar;
