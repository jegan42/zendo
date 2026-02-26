import React, { useState } from "react";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import RedeemIcon from "@mui/icons-material/Redeem";
import StorefrontIcon from "@mui/icons-material/Storefront";
import "./ProfileMenu.css";
import UserInfosModal from "../Modal/UserInfoMoal/UserInfoModal";

const ProfileMenu = () => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const menuItems = [
    {
      icon: <PersonOutlineIcon />,
      label: "Informations personnelles",
      // On ajoute une fonction onClick uniquement pour cet item
      action: () => setIsInfoModalOpen(true),
    },
    {
      icon: <RedeemIcon />,
      label: "Mes commandes",
      link: "/orders",
    },
    {
      icon: <StorefrontIcon />,
      label: "Ouvrir ma boutique",
      link: "/vendeur",
    },
  ];

  return (
    <div className="profile-menu-container">
      <h3 className="profile-menu-title">Gestion de votre profil</h3>
      <div className="white-card">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="menu-item"
            onClick={item.action ? item.action : undefined} // Déclenche la modal si l'action existe
          >
            <div className="menu-item-left">
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* INDISPENSABLE : Appeler le composant ici pour qu'il puisse s'afficher */}
      <UserInfosModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
};

export default ProfileMenu;
