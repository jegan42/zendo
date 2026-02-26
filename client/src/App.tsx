// =============================================================
// APP.TSX - Routeur principal de l'application
// Definit quelle URL affiche quelle page
// Gere aussi l'affichage conditionnel de la Navbar
// =============================================================

import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// --- Pages ---
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import RecoveryScreen from "./pages/Auth/RecoveryScreen";
import ResetScreen from "./pages/Auth/ResetScreen";
import ProductDetail from "./pages/ProductDetail";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Favoris from "./pages/Favoris";
import Profil from "./pages/Profil";
import Shop from "./pages/Shop";
import ProductList from "./pages/ProductList";
import Cart from "./pages/Cart";
import SellerHome from "./pages/Seller/SellerHome";

// --- Composants ---
import Navbar from "./components/Navbar/Navbar";

// Reducers
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import userSlice from "./reducers/user";

const store = configureStore({
  reducer: {
    user: userSlice,
  },
});

function AppContent() {
  // useLocation() necessaire pour cacher la Navbar sur les pages d'auth
  const location = useLocation();

  // On cache la navbar sur les pages d'auth
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/recovery" ||
    location.pathname === "/reset";

  return (
    <>
      <Routes>
        {/* --- Pages d'authentification (sans navbar) --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/recovery" element={<RecoveryScreen />} />
        <Route path="/reset" element={<ResetScreen />} />

        {/* --- Pages principales (avec navbar) --- */}
        <Route path="/home" element={<Home />} />
        <Route path="/recherche" element={<Search />} />
        <Route path="/favoris" element={<Favoris />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/boutique" element={<Shop />} />

        {/* --- Route produit (avant les catch-all dynamiques) --- */}
        <Route path="/produit/:id" element={<ProductDetail />} />

        {/* --- Route vendeur --- */}
        <Route path="/vendeur" element={<SellerHome />} />

        {/* --- Routes dynamiques (ProductList par famille/categorie) --- */}
        {/* IMPORTANT : ces routes doivent etre APRES les routes fixes
            sinon "favoris" serait interprete comme un nom de famille */}
        <Route path="/:family" element={<ProductList />} />
        <Route path="/:family/:category" element={<ProductList />} />
        {/* --- Route par defaut : redirige vers login --- */}
        {/* Plus tard on pourra rediriger vers /accueil si l'utilisateur est connecte */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/produit/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>

      {/* On affiche la Navbar seulement si on est PAS sur une page d'auth */}
      {!hideNavbar && <Navbar />}
    </>
  );
}

function App() {
  return (
    // BrowserRouter : active le systeme de routing (navigation entre pages)
    // Grace a lui on remplace le composant appele sans reload
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

// On exporte pour l'utiliser dans main.tsx
export default App;
