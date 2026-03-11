import React, { useEffect, useState } from "react";
import Button from "../../Button/Button";
import "../UserInfoMoal/UserInfoModal.css";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import defaultLogo from "../../../asset/Logo/Logo.png";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setCredentials } from "../../../reducers/user";
import { jwtDecode } from "jwt-decode";
import { getShopInfos, createShop, updateShop } from "../../../services/sellerService";

interface ShopInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    isFirstTime?: boolean; // Pour gérer le texte du bouton
    onSuccess: () => void; // Ajout de la prop
}

const ShopInfoModal = ({
    isOpen,
    onClose,
    isFirstTime,
    onSuccess,
}: ShopInfoModalProps) => {
    const { userInfo: user, token } = useSelector((state: any) => state.user);
    const dispatch = useDispatch();

    const [shopName, setShopName] = useState("");
    const [siretNumber, setSiretNumber] = useState("");
    const [shopLogo, setShopLogo] = useState("");

// Utilitaire pour récupérer l'ID utilisateur
    const getUserId = () => {
    let userId = user?._id || user?.id;
    if (!userId && token) {
      try {
        const decoded: any = jwtDecode(token);
        userId = decoded.id || decoded._id || decoded.userId;
      } catch (e) { console.error("Erreur décodage", e); }
    }
    return userId;
  };

    // CHARGEMENT DES DONNÉES (si c'est une modification)
    useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;
      const userId = getUserId();
      
      if (userId) {
        try {
          const data = await getShopInfos(userId);
          if (data) {
            setShopName(data.shopName || "");
            setSiretNumber(data.siretNumber || "");
            setShopLogo(data.shopLogo || "");
          }
        } catch (error) {
          // Si erreur 404 (pas de boutique encore), on réinitialise
          setShopName("");
          setSiretNumber("");
        }
      }
    };
    loadData();
  }, [isOpen]);

       const handleSave = async () => {
    const userId = getUserId();
    if (!userId) {
      alert("ID utilisateur introuvable.");
      return;
    }

    try {
      const payload = { shopName, siretNumber, shopLogo };

      if (isFirstTime) {
        const res = await createShop(userId, payload);
        dispatch(setCredentials({ user: res.user, token }));
        alert("Boutique créée !");
        onSuccess();
      } else {
        await updateShop(userId, payload);
        alert("Modifications enregistrées !");
      }
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  if (!isOpen) return null;

    return (
    <div className="modal-overlay">
      <div className="modal-content info-modal-container">
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Informations de la boutique</h2>

        <div className="profile-header-container">
          <div className="avatar-wrapper">
            <div className="avatar-circle">
              <img src={shopLogo || defaultLogo} alt="Logo Boutique" />
            </div>
            <button className="photo-edit-badge">
              <CameraAltIcon sx={{ fontSize: 18, color: "white" }} />
            </button>
          </div>
        </div>

        <div className="info-section-wrapper">
          <div className="info-section">
            <div className="input-group">
              <label>Nom de la boutique</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Ex: Ma Boutique"
              />
            </div>
            <div className="input-group">
              <label>SIRET</label>
              <input
                type="text"
                value={siretNumber}
                onChange={(e) => setSiretNumber(e.target.value)}
                placeholder="123 456 789 00012"
              />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <Button variant="primary" onClick={handleSave}>
            {isFirstTime ? "Ouvrir ma boutique" : "Enregistrer les modifications"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShopInfoModal;
