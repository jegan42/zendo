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
      const response = await axios.post(
        "http://localhost:5001/api/auth/login",
        {
          email,
          password,
        },
      );
      // 1. Sauvegarde browser
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // 2. ACTUALISATION REDUX (Ce qui permet l'affichage sur la page Profil)
      dispatch(
        setCredentials({
          user: response.data.user,
          token: response.data.token,
        }),
      );

      // alert("Connexion reussie !");
      // TODO: Redirection vers /home ou /profil
      navigate("/home");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur de connexion au serveur");
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