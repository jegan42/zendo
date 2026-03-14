import { useState, useEffect } from "react";
import "../../styles/Auth.css";
import Button from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { Message } from "../../components/Message/Message";
import api from "../../services/api";

function ResetScreen() {
  const navigate = useNavigate();
  useEffect(() => {
    /* URLSearchParams : permet de recuperer les parametres dans l'URL (ce qui est après le ? dans l'URL)
    ex ici : http://localhost:3000/reset?token=xxx */
    const params = new URLSearchParams(window.location.search);
    /*ici le setToken = à ce qu'on a récupéré dans l'URL et on met à jour le state token*/
    setToken(params.get("token") as string);
  }, []);

  // STATES
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [token, setToken] = useState("");

  // Fonction de soumission du formulaire

  const verif = () => {
    if (password !== password2) {
      setError("Les mots de passe ne correspondent pas");
    } else if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
    }
  };
  const handleSubmit = async () => {
    setError("");

    if (password !== password2) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      const response = await api.post(
        "/auth/reset",
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.message === "Mot de passe mis à jour") {
        navigate("/login");
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      console.error("Erreur reset mot de passe :", err);
      setError(err?.response?.data?.message || "Erreur serveur");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-return">
          <Link to="/login" className="link">
            <FontAwesomeIcon icon={faArrowLeft} size="lg" color="#3b4553" />
          </Link>
        </div>
        {/* --- EN-TETE : logo + titre --- */}
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-text">Z</span>
          </div>
          <h1 className="auth-title">ZENDO</h1>
          <p className="auth-subtitle">L'artisanat en tout simplicité</p>
        </div>
        <Message variant="error" message={error} />

        <div className="form-group">
          <label htmlFor="password">Nouveau mot de passe</label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={function (e) {
              setPassword(e.target.value);
            }}
            required
          />
          <label htmlFor="password2">Confirmation mot de passe</label>
          <Input
            id="password2"
            type="password"
            placeholder="********"
            value={password2}
            onChange={function (e) {
              setPassword2(e.target.value);
            }}
            required
          />
          <Button onClick={handleSubmit}>Réinitialiser mon mot de passe</Button>
        </div>
      </div>
    </div>
  );
}
export default ResetScreen;
