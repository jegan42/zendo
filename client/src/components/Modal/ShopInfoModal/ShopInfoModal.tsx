import React, { useState } from "react";
import Button from "../../Button/Button";
import "../UserInfoMoal/UserInfoModal.css";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import defaultLogo from "../../../asset/Logo/Logo.png";

interface ShopInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstTime?: boolean; // Pour gérer le texte du bouton
}

const ShopInfoModal = ({
  isOpen,
  onClose,
  isFirstTime = true,
}: ShopInfoModalProps) => {
  const [shopName, setShopName] = useState("");
  const [siretNumber, setSiretNumber] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    // Logique de sauvegarde à venir (Backend)
    console.log({ shopName, siretNumber });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content info-modal-container">
        {/* BOUTON FERMER ("x") EN HAUT À DROITE */}
        <button
          className="modal-close-button"
          onClick={onClose}
          aria-label="Fermer la fenêtre"
        >
          &times; {/* Entité HTML pour le symbole de multiplication (X) */}
        </button>

        <h2 className="modal-title">Informations de la boutique</h2>

        <div className="profile-header-container">
          <div className="avatar-wrapper">
            <div className="avatar-circle">
              <img src={defaultLogo} alt="Profil" />
            </div>
            {/* Le badge noir avec l'icône blanche en bas à droite */}
            <button className="photo-edit-badge" title="Changer la photo">
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
          {/* Le bouton "Annuler" a été supprimé ici */}
          <Button variant="primary" onClick={handleSave}>
            {isFirstTime
              ? "Ouvrir ma boutique"
              : "Enregistrer les modifications"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShopInfoModal;
