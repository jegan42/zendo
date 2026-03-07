/* PAGE RECHERCHE - Barre de recherche + menu categories (sidebar)
 * Layout : sidebar gauche (CategoryMenu) + zone de resultats a droite
 * Utilise le composant reutilisable SearchBar + CategoryMenu
 *
 * QUERY PARAMS (lus depuis l'URL avec useSearchParams) :
 *   ?family=Femme         → filtre par famille
 *   ?category=Bijoux      → filtre par categorie (combine avec family)
 *   ?q=boucles            → recherche textuelle
 *
 * FLUX :
 * 1. L'utilisateur arrive (depuis Home ou CategoryMenu) avec des query params
 * 2. useEffect detecte les params → construit l'URL API → fetch
 * 3. Les resultats sont affiches via ProductView (avec modal variantes)
 * 4. Si l'utilisateur tape dans la SearchBar → on met a jour ?q= → re-fetch
 * 5. Si l'utilisateur clique dans le CategoryMenu → on met a jour ?family= → re-fetch
 */

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import SearchBar from "../components/SearchBar";
import CategoryMenu from "../components/CategoryMenu/CategoryMenu";
import ProductView from "../components/ProductView/ProductView";
import "../styles/Search.css";
import api from "../services/api";

function Search() {
    /*  --- QUERY PARAMS ---
     * useSearchParams() set param après"?"
     * Exemple : /recherche?family=Femme&category=Bijoux
     * earchParams.get("family") retourne "Femme"
     * setSearchParams({ family: "Homme" }) change l'URL sans recharger la page
     */
    const [searchParams, setSearchParams] = useSearchParams();

    // --- STATES ---
    // Resultats retournés par l'API
    const [results, setResults] = useState<any[]>([]);

    // Indique si un chargement est en cours (pour afficher "Chargement...")
    const [loading, setLoading] = useState(false);

    // Indique si au moins une recherche/filtre a ete applique
    // Sert a distinguer "page vide au demarrage" de "recherche sans resultats"
    const [hasSearched, setHasSearched] = useState(false);

    // --- LECTURE DES QUERY PARAMS ---
    // .get() retourne la valeur du param ou null si absent
    const familyParam = searchParams.get("family");
    const categoryParam = searchParams.get("category");
    const queryParam = searchParams.get("q");

    /*  --- EFFET : FETCH AUTOMATIQUE QUAND LES PARAMS CHANGENT ---
     * Se declenche quand familyParam, categoryParam ou queryParam change :
     * - Chargement initial (si URL contient deja des params)
     * - Clic dans CategoryMenu (modifie ?family= et ?category=)
     * Recherche textuelle (modifie ?q=)
     */
    useEffect(() => {
        // si aucun paramètre, on réinitialise
        if (!familyParam && !categoryParam && !queryParam) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        const fetchProducts = async () => {
            try {
                setLoading(true);
                setHasSearched(true);

                // Construction des params
                const params: Record<string, string> = {};
                if (familyParam) params.family = familyParam;
                if (categoryParam) params.category = categoryParam;
                if (queryParam) params.q = queryParam;

                // Requête API
                const response = await api.get("/products", { params });
                setResults(response.data.products || []);
            } catch (error) {
                console.error("Erreur lors de la recherche:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [familyParam, categoryParam, queryParam]);

    /* --- FONCTION APPELEE PAR SEARCHBAR ---
     * Quand l'utilisateur clique "Rechercher", on met a jour le param ?q= dans l'URL
     * Ca declenche le useEffect qui re-fetch automatiquement
     */
    function handleSearch(query: string) {
        // On garde les filtres famille/categorie actifs et on ajoute/modifie q
        const newParams: Record<string, string> = {};
        if (familyParam) {
            newParams.family = familyParam;
        }
        if (categoryParam) {
            newParams.category = categoryParam;
        }
        newParams.q = query;
        setSearchParams(newParams);
    }

    /* --- FONCTION APPELEE PAR CATEGORYMENU ---
     * Quand l'utilisateur clique sur une famille ou categorie dans le menu,
     * on met a jour les query params. Le useEffect detecte le changement
     * et lance le fetch.
     */
    function handleCategorySelect(family: string, category?: string) {
        const newParams: Record<string, string> = { family: family };
        if (category) {
            newParams.category = category;
        }
        // On ecrase les anciens params (y compris q) pour repartir sur un filtre propre
        setSearchParams(newParams);
    }

    // --- AFFICHAGE ---
    return (
        <div className="search-page-container">
            {/* Barre de recherche en haut */}
            {/* initialQuery pre-remplit la barre si ?q= est dans l'URL */}
            <header className="search-header">
                <SearchBar
                    onSearch={handleSearch}
                    initialQuery={queryParam || ""}
                />
            </header>

            {/* Layout : sidebar + resultats */}
            <div className="search-layout">
                {/* Colonne gauche : menu des familles et categories */}
                <aside className="search-sidebar">
                    <CategoryMenu
                        onSelect={handleCategorySelect}
                        activeFamily={familyParam || undefined}
                        activeCategory={categoryParam || undefined}
                    />
                </aside>

                {/* Colonne droite : resultats de recherche */}
                <div className="search-results">
                    {/* Indicateur de chargement */}
                    {loading && <p className="search-loading">Chargement...</p>}

                    {/* Compteur de resultats */}
                    {hasSearched && !loading && results.length > 0 && (
                        <p className="search-count">
                            {results.length} resultat
                            {results.length > 1 ? "s" : ""} trouve
                            {results.length > 1 ? "s" : ""}
                            {queryParam ? ' pour "' + queryParam + '"' : ""}
                            {familyParam ? " dans " + familyParam : ""}
                            {categoryParam ? " > " + categoryParam : ""}
                        </p>
                    )}

                    {/* Etat vide : recherche faite mais aucun resultat */}
                    {hasSearched && !loading && results.length === 0 && (
                        <div className="search-empty">
                            <p className="search-empty-title">Aucun resultat</p>
                            <p className="search-empty-hint">
                                Essayez avec d'autres mots-cles ou explorez les
                                categories
                            </p>
                        </div>
                    )}

                    {/* Liste des produits trouves */}
                    {/* On utilise ProductView qui inclut le bouton panier + modal variantes */}
                    {!loading && results.length > 0 && (
                        <div className="search-results-grid">
                            {results.map(function (product) {
                                return (
                                    <ProductView
                                        key={product._id}
                                        id={product._id}
                                        title={product.name}
                                        price={product.price}
                                        image={
                                            product.images && product.images[0]
                                                ? product.images[0]
                                                : ""
                                        }
                                        description={product.description || ""}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Search;
