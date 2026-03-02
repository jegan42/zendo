import React from "react";
import { useSelector } from "react-redux";
import CameraAltIcon from "@mui/icons-material/CameraAlt"; // Utilisation de MUI comme Login
import "./ProfileHeader.css";
// importer la photo profil par défaut
import defaultAvatar from "../../asset/Logo/profil.png"; 

const ProfileHeader = () => {
  // On récupère userInfo depuis la clé 'user' définie dans le store de App.tsx
  const user = useSelector((state: any) => state.user.userInfo);
  


  return (
    <div className="profile-header-container">
      <div className="avatar-wrapper">
        <div className="avatar-circle">
          <img 
            src={user?.profilePicture || defaultAvatar} 
            alt="Profil" 
          />
        </div>
        {/* Le badge noir avec l'icône blanche en bas à droite */}
        <button className="photo-edit-badge" title="Changer la photo">
          <CameraAltIcon sx={{ fontSize: 18, color: "white" }} />
        </button>
      </div>

      <h2 className="profile-display-name">
        {user ? `${user.firstName} ${user.lastName}` : "Utilisateur"}
      </h2>
    </div>
  );
};

export default ProfileHeader;