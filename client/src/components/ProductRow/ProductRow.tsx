// =============================================================
// COMPOSANT PRODUCTROW - Rangee horizontale
// Fetch vers le backend en fonction de l'endpoint fourni
// =============================================================

import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../ProductCard/ProductCard";
import "./ProductRow.css";
import api from "../../services/api";

// Props du composant
interface ProductRowProps {
    title: string; // titre de la section (ex: "Nouveautes")
    endpoint: string; // query string pour le fetch (ex: "?sort=recent&limit=8")
    onProductClick: (product: any) => void; // fonction appelee au clic sur un produit
}

function ProductRow(props: ProductRowProps) {
    // --- STATES ---
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Charger les produits au montage du composant
    useEffect(
        function () {
            const fetchProducts = async () => {
                try {
                    const response = await api.get<{
                        products: any[];
                    }>(`/products${props.endpoint}`);

                    setProducts(response.data?.products ?? []);
                } catch (err) {
                    setError("Impossible de charger les produits");
                } finally {
                    setLoading(false);
                }
            };

            fetchProducts();
        },
        [props.endpoint]
    ); //relance si la valeur change

    return (
        <section className="product-row-section">
            <h2 className="product-row-title">{props.title}</h2>

            {/* Chargement */}
            {loading && <p className="product-row-loading">Chargement...</p>}

            {/* Erreur */}
            {error && <p className="product-row-error">{error}</p>}

            {/* Liste horizontale scrollable */}
            {!loading && !error && products.length > 0 && (
                <div className="product-row-scroll">
                    {products.map(function (product) {
                        return (
                            <div key={product._id} className="product-row-item">
                                <ProductCard
                                    product={product}
                                    onClick={props.onProductClick}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Aucun produit */}
            {!loading && !error && products.length === 0 && (
                <p className="product-row-empty">
                    Aucun produit pour le moment
                </p>
            )}
        </section>
    );
}

export default ProductRow;
