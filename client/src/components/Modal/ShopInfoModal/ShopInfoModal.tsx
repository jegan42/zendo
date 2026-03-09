import React, { useEffect, useState } from "react";
import Button from "../../Button/Button";
import "../UserInfoMoal/UserInfoModal.css";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import defaultLogo from "../../../asset/Logo/Logo.png";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setCredentials } from "../../../reducers/user";
import { jwtDecode } from "jwt-decode";
import api from "../../../services/api";

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

    // CHARGEMENT DES DONNÉES (si c'est une modification)
    useEffect(() => {
        const loadShopData = async () => {
            if (!isOpen) return;

            if (!isFirstTime && user?._id) {
                try {
                    const response = await api.get(`/seller/infos/${user._id}`);
                    const data = response.data;

                    setShopName(data.shopName || "");
                    setSiretNumber(data.siretNumber || "");
                    setShopLogo(data.shopLogo || "");
                } catch (error) {
                    console.error(
                        "Erreur lors du chargement des infos boutique :",
                        error
                    );
                }
            } else if (isFirstTime) {
                // Reset des champs si création de boutique
                setShopName("");
                setSiretNumber("");
                setShopLogo("");
            }
        };

        loadShopData();
    }, [isOpen, isFirstTime, user?._id]);

    const handleSave = async () => {
        // 1. Essayer de récupérer l'ID via Redux
        let userId = user?._id || user?.id;

        // 2. Si toujours rien, décoder le token
        if (!userId && token) {
            try {
                const decoded: any = jwtDecode(token);
                userId = decoded.id || decoded._id || decoded.userId;
            } catch (e) {
                console.error("Erreur décodage token", e);
            }
        }

        // 3. Validation finale
        if (!userId) {
            alert(
                "Erreur : ID utilisateur introuvable. Veuillez vous reconnecter."
            );
            return;
        }

        console.log("ID utilisé pour la requête :", userId);

        try {
            const payload = { shopName, siretNumber, shopLogo };

            if (isFirstTime) {
                try {
                    const res = await api.post(
                        `/seller/create/${userId}`,
                        payload
                    );
                    dispatch(setCredentials({ user: res.data.user, token }));
                    onSuccess();
                    alert("Boutique créée !");
                } catch (err: any) {
                    console.error("Erreur création boutique :", err);
                    alert(
                        err.response?.data?.message ||
                            "Erreur lors de la création"
                    );
                }
            } else {
                try {
                    await api.put(`/seller/update/${userId}`, payload);
                    alert("Modifications enregistrées !");
                } catch (err: any) {
                    console.error("Erreur mise à jour boutique :", err);
                    alert(
                        err.response?.data?.message ||
                            "Erreur lors de la mise à jour"
                    );
                }
            }
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || "Erreur serveur");
        }
    };
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content info-modal-container">
                {/* BOUTON FERMER ("x") EN HAUT À DROITE */}
                <button
                    className="modal-close-button"
                    onClick={onClose}
                    aria-label="Fermer la fenêtre"
                >
                    &times;{" "}
                    {/* Entité HTML pour le symbole de multiplication (X) */}
                </button>

                <h2 className="modal-title">Informations de la boutique</h2>

                <div className="profile-header-container">
                    <div className="avatar-wrapper">
                        <div className="avatar-circle">
                            <img src={defaultLogo} alt="Profil" />
                        </div>
                        {/* Le badge noir avec l'icône blanche en bas à droite */}
                        <button
                            className="photo-edit-badge"
                            title="Changer la photo"
                        >
                            <CameraAltIcon
                                sx={{ fontSize: 18, color: "white" }}
                            />
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
