// =============================================================
// MAIN - Point d'entree de l'app
// Fait le lien entre React et HTML (dans la div #root)
// =============================================================

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";

// On recupere la div avec l'id "root" de index.html
// on demande a react d'afficher le composant App dedans
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <App />
        </GoogleOAuthProvider>
    </React.StrictMode>
);
