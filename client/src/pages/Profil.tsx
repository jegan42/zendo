// =============================================================
// PAGE PROFIL - Informations de l'utilisateur connecte
// Pour l'instant c'est un placeholder (page vide)
// Plus tard on affichera : infos perso, parametres, "Ouvrir ma boutique"
// =============================================================

import React from "react";
import ProfileHeader from "../components/Profils/ProfileHeader";
import ProfileMenu from "../components/Profils/ProfileMenu";
import RecentOrders from "../components/Profils/RecentOrders";
import ProfileSettings from "../components/Profils/ProfileSettings";
import "../styles/Pages.css";
import { Header } from "../components/Header/Header";

const Profil = () => {
  return (
    <div className="page-container">
      {/* Affichage de la partie haute (photo + nom) */}
      <ProfileHeader />

      {/* Partie menu de gestion */}
      <ProfileMenu />

      {/* Section 2 : Achats récents */}
      <RecentOrders />
      {/* 4. Section Paramètres (Langue + Déconnexion) */}
      <ProfileSettings />
    </div>
  );
};

export default Profil;