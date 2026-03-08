import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../reducers/user"; // Import de l'action créée dans redux
import LanguageIcon from "@mui/icons-material/Language";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./ProfileMenu.css"

const ProfileSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Vide Redux et le LocalStorage via le reducer
    dispatch(logout());
    // 2. Redirige vers la page de login
    navigate("/login");
  };

  return (
    <div className="profile-menu-container">
      <h3 className="section-title">Paramètres de votre profil</h3>
      <div className="white-card">
        
        {/* Ligne Langue */}
        <div className="menu-item">
          <div className="menu-item-left">
            <LanguageIcon className="menu-icon" />
            <span>Language</span>
          </div>
          <div className="menu-item-right">
            <span className="language-selected">Français</span>
            <ChevronRightIcon className="chevron-icon" />
          </div>
        </div>

        {/* Ligne Déconnexion */}
        <div className="menu-item" onClick={handleLogout}>
          <div className="menu-item-left">
            <LogoutIcon className="menu-icon" />
            <span>Déconnexion</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileSettings;