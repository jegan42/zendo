// =============================================================
// PAGE SIGNUP - Formulaire de creation de compte
// L'utilisateur entre son prenom, nom, email et mot de passe
// pour creer un nouveau compte
// =============================================================

import React, { useState } from "react";
import axios from "axios";
import "../../styles/Auth.css";
import api from "../../services/api";

function Signup() {
    // STATES
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Erreur & succès
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    //  FONCTION DE SOUMISSION DU FORMULAIRE (meme logique que pour login)
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setError("");
        setSuccess("");

        try {
            // POST signup via api
            const response = await api.post("/auth/signup", {
                firstName,
                lastName,
                email,
                password,
            });

            // Compte créé
            setSuccess(response.data.message);

            // Sauvegarder token et user dans le localStorage
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            alert("Compte créé avec succès !");

            // TODO: rediriger vers /login ou /home
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Erreur de connexion au serveur");
            }
        }
    }

    // --- AFFICHAGE (JSX) ---
    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* --- EN-TETE : logo + titre --- */}
                <div className="auth-header">
                    <div className="auth-logo">
                        <span className="logo-text">Z</span>
                    </div>
                    <h1 className="auth-title">ZENDO</h1>
                    <p className="auth-subtitle">
                        L'artisanat en tout simplicite
                    </p>
                </div>

                {/* --- FORMULAIRE --- */}
                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Gestion erreur */}
                    {error && <p className="auth-error">{error}</p>}

                    {/* Connexion OK */}
                    {success && <p className="auth-success">{success}</p>}

                    {/* Champ prenom */}
                    <div className="form-group">
                        <label htmlFor="firstName">Prenom</label>
                        <input
                            id="firstName"
                            type="text"
                            placeholder="Jean"
                            value={firstName}
                            onChange={function (e) {
                                setFirstName(e.target.value);
                            }}
                            required
                        />
                    </div>

                    {/* Champ nom */}
                    <div className="form-group">
                        <label htmlFor="lastName">Nom</label>
                        <input
                            id="lastName"
                            type="text"
                            placeholder="Dupont"
                            value={lastName}
                            onChange={function (e) {
                                setLastName(e.target.value);
                            }}
                            required
                        />
                    </div>

                    {/* Champ email */}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="johndoe@example.com"
                            value={email}
                            onChange={function (e) {
                                setEmail(e.target.value);
                            }}
                            required
                        />
                    </div>

                    {/* Champ mot de passe */}
                    <div className="form-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={function (e) {
                                setPassword(e.target.value);
                            }}
                            required
                            minLength={6}
                        />
                    </div>

                    {/* Bouton de soumission */}
                    <button type="submit" className="auth-button">
                        Creer mon compte
                    </button>
                </form>

                {/* --- LIENS EN BAS --- */}
                <div className="auth-links">
                    <p className="auth-link-switch">
                        Deja un compte ? <a href="/login">Se connecter</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

//  Export du composant pour l'utiliser dans App.tsx
export default Signup;
