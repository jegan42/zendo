import React, { useState, useEffect } from "react";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import RedeemIcon from "@mui/icons-material/Redeem";
import StorefrontIcon from "@mui/icons-material/Storefront";
import "./ProfileMenu.css";
import UserInfosModal from "../Modal/UserInfoMoal/UserInfoModal";
import ShopInfoModal from "../Modal/ShopInfoModal/ShopInfoModal";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getShopInfos, updateShop } from "../../services/sellerService";

const ProfileMenu = () => {
    const navigate = useNavigate();
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
          const data = await getShopInfos(userId);
          if (data) {
            setHasShop(true);
            setShopStatus(data.shopStatus);
          } else {
            setHasShop(false);
          }
        } catch (error) {
          console.error("Erreur checkSellerStatus", error);
        }
      }
    };
    checkSellerStatus();
  }, [user]);

// ACTION : Toggle du mode vacances
    const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    const userId = user?._id || user?.id;

    if (!userId) return;

    try {
      const newStatus = !shopStatus;
      // On utilise le service au lieu d'axios
      await updateShop(userId, { shopStatus: newStatus });
      setShopStatus(newStatus);
    } catch (error) {
      console.error("Erreur update status", error);
      alert("Impossible de changer le statut de la boutique.");
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
      action: () => setIsInfoModalOpen(true),
    },
    {
      icon: <RedeemIcon />,
      label: "Mes commandes",
      action: () => navigate("/orders"),
    },
    {
      icon: <StorefrontIcon />,
      label: hasShop
        ? shopStatus
          ? "Ma boutique"
          : "Mode vacances"
        : "Ouvrir ma boutique",
      action: () => setIsShopModalOpen(true),
      showToggle: hasShop, 
    },
  ];

  return (
    <div className="profile-menu-container">
      <h3 className="profile-menu-title">Gestion de votre profil</h3>
      <div className="white-card">
        {menuItems.map((item, index) => (
          <div key={index} className="menu-item" onClick={item.action}>
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

      <UserInfosModal isOpen={isInfoModalOpen} onClose={handleCloseModal} />
      <ShopInfoModal
        isOpen={isShopModalOpen}
        onClose={handleCloseModal}
        isFirstTime={!hasShop}
        onSuccess={() => {
          setHasShop(true);
          setShopStatus(true);
        }}
      />
    </div>
  );
};

export default ProfileMenu;
