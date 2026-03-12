// =============================================================
// PAGE HOME
// Assemble les composants :
// SearchBar, FamilyCards, ProductRow (x3), CategoryChips
// =============================================================

import React from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import FamilyCards from "../components/FamilyCards/FamilyCards";
import ProductRow from "../components/ProductRow/ProductRow";

import CategoryChips from "../components/CategoryChips/CategoryChips";
import { Header } from "../components/Header/Header";
import "../styles/Home.css";

// --- CONSTANTES ---

// Les 4 familles affichees sur la page d'accueil
const FAMILLES = ["Femme", "Homme", "Enfant", "Maison"];

// Les categories pour la section "Acheter par categorie"
const CATEGORIES = [
  "Vetements",
  "Bijoux",
  "Chaussures",
  "Sacs",
  "Accessoires",
  "Decoration",
  "Luminaire",
  "Art_de_la_table",
];

function Home() {
  const navigate = useNavigate();

  // --- FONCTIONS DE NAVIGATION ---

  // Recherche texte
  function handleSearch(query: string) {
    navigate("/recherche?q=" + query);
  }

  // Clic sur une famille
  function handleFamilyClick(family: string) {
    navigate("/recherche?family=" + family);
  }

  // Clic sur une categorie
  function handleCategoryClick(category: string) {
    navigate("/recherche?category=" + category);
  }

  // Clic sur un produit (redirige vers la fiche)
  function handleProductClick(product: any) {
    navigate("/produit/" + product._id);
  }

  // --- AFFICHAGE ---
  return (
    <div className="home-container">
      {/* Provisoire en attendant composant header */}
      <Header />

      {/* --- BARRE DE RECHERCHE --- */}
      <div className="home-search">
        <SearchBar
          placeholder="Rechercher un produit, un artisan..."
          onSearch={handleSearch}
        />
      </div>
      {/* 1. FAMILLES (Femme, Homme, Enfant, Maison) */}
      <FamilyCards families={FAMILLES} onFamilyClick={handleFamilyClick} />

      {/* 2. SELECTIONS PAR FAMILLE (tri aleatoire pour varier a chaque visite) */}
      <ProductRow
        title="Selection Femme"
        endpoint="?family=Femme&sort=random&limit=8"
        onProductClick={handleProductClick}
      />

      <ProductRow
        title="Selection Homme"
        endpoint="?family=Homme&sort=random&limit=8"
        onProductClick={handleProductClick}
      />

      {/* 3. MADE IN FRANCE */}
      <ProductRow
        title="Made in France"
        endpoint="?madeInFrance=true&sort=random&limit=8"
        onProductClick={handleProductClick}
      />

      {/* 4. CATEGORIES  */}
      <CategoryChips
        categories={CATEGORIES}
        onCategoryClick={handleCategoryClick}
      />

      {/* 5. SELECTION MAISON */}
      <ProductRow
        title="Selection Maison"
        endpoint="?family=Maison&sort=random&limit=8"
        onProductClick={handleProductClick}
      />
    </div>
  );
}

export default Home;
