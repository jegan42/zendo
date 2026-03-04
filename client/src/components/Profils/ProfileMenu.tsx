import React, { useState, useEffect } from "react";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import RedeemIcon from "@mui/icons-material/Redeem";
import StorefrontIcon from "@mui/icons-material/Storefront";
import "./ProfileMenu.css";
import UserInfosModal from "../Modal/UserInfoMoal/UserInfoModal";
import ShopInfoModal from "../Modal/ShopInfoModal/ShopInfoModal";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";

const ProfileMenu = () => {
  const dispatch = useDispatch();
  const { userInfo: user, token } = useSelector((state: any) => state.user);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);

  // État pour le Toggle Status de la boutique
  const [hasShop, setHasShop] = useState(false); // Est-ce qu'une boutique existe ?
  const [shopStatus, setShopStatus] = useState(true); // Active ou Vacances ?

  // Récupérer le statut réel au chargement si c'est un vendeur
  useEffect(() => {
    const checkSellerStatus = async () => {
      const userId = user?._id || user?.id;
      if (userId) {
        try {
          const res = await axios.get(
            `http://localhost:5001/api/seller/infos/${userId}`,
          );
          if (res.data) {
            setHasShop(true);
            setShopStatus(res.data.shopStatus);
          } else {
            setHasShop(false);
          }
        } catch (error) {
          console.error("Erreur checkSellerStatus", error);
        }
      }
    };
    checkSellerStatus();
  }, [user?._id, user?.id]);

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche d'ouvrir la modal en cliquant sur le toggle
    try {
      const newStatus = !shopStatus;
      await axios.put(`http://localhost:5001/api/seller/update/${user._id}`, {
        shopStatus: newStatus,
      });
      setShopStatus(newStatus);
    } catch (error) {
      console.error("Erreur update status", error);
    }
  };

  const handleCloseModal = () => {
    setIsInfoModalOpen(false);
    setIsShopModalOpen(false);
  };

  const menuItems = [
    {
      icon: <PersonOutlineIcon />,
      label: "Informations personnelles",
      // On déclenche l'ouverture de la modal info ici
      action: () => setIsInfoModalOpen(true),
    },
    {
      icon: <RedeemIcon />,
      label: "Mes commandes",
      link: "/orders",
    },
    {
      icon: <StorefrontIcon />,
      // Utilisation de hasShop au lieu de user.role
      label: hasShop
        ? shopStatus
          ? "Ma boutique"
          : "Mode vacances"
        : "Ouvrir ma boutique",
      action: () => setIsShopModalOpen(true),
      showToggle: hasShop, // Toggle uniquement si la boutique existe
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
            onClick={item.action} // Déclenche la modal si l'action existe
          >
            <div className="menu-item-left">
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </div>
            {item.showToggle && (
              <div
                className={`toggle-switch ${shopStatus ? "active" : ""}`}
                onClick={handleToggleStatus}
              >
                <div className="thumb"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Appeler le composant ici pour qu'il puisse s'afficher */}
      <UserInfosModal isOpen={isInfoModalOpen} onClose={handleCloseModal} />
      <ShopInfoModal
        isOpen={isShopModalOpen}
        onClose={handleCloseModal}
        isFirstTime={!hasShop}
        // On met à jour l'état local dès que la création réussit
        onSuccess={() => {
          setHasShop(true);
          setShopStatus(true);
        }}
      />
    </div>
  );
};

export default ProfileMenu;
