// =============================================================
// PAGE LOGIN (version refactorisee) - Utilise les composants Button, Input, Message
// =============================================================

import React, { useState } from "react";
import axios from "axios";
import "../../styles/Auth.css";
import Button from "../../components/Button/Button";
import GoogleIcon from "@mui/icons-material/Google";
import { Input } from "../../components/Input/Input";
import AuthHeader from "./AuthHeader";
import { Message } from "../../components/Message/Message";
import AuthFooter from "./AuthFooter";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../reducers/user";
import { useNavigate } from "react-router-dom"; // Pour rediriger vers le profil
import api from "../../services/api";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const dispatch = useDispatch(); // Initialisation du dispatch
    const navigate = useNavigate(); // Initialisation du hook useNavigate

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            // Login n'a pas besoin de token → on utilise api directement
            const response = await api.post("/auth/login", {
                email,
                password,
            });

            const { token, user } = response.data;

            // 1️⃣ Sauvegarde dans le localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            // 2️⃣ Mise à jour Redux pour refléter la connexion
            dispatch(setCredentials({ user, token }));

            // 3️⃣ Redirection après connexion
            navigate("/home");
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Erreur de connexion au serveur"
            );
        }
    };

    const handleGoogle = () => {
        // TODO: connection Google a implementer
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* --- EN-TETE : logo + titre --- */}
                <AuthHeader />
                <Message message={error} variant="error" />
                {/* --- FORMULAIRE --- */}
                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Champ email */}
                    <Input
                        label="Email"
                        type="email"
                        placeholder="johndoe@example.com"
                        value={email}
                        onValueChange={setEmail}
                        required
                    />
                    {/* Champ mot de passe */}
                    <Input
                        label="Mot de passe"
                        type="password"
                        placeholder="********"
                        value={password}
                        onValueChange={setPassword}
                        required
                    />
                    {/* Bouton de soumission */}
                    <Button type="submit">Se connecter</Button>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="auth-button"
                        leftIcon={<GoogleIcon />}
                        onClick={handleGoogle}
                    >
                        Google
                    </Button>
                </form>
                {/* --- LIENS EN BAS --- */}
                <AuthFooter />
            </div>
        </div>
    );
};

export default Login;
