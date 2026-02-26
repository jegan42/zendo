// =============================================================
// PAGE PRODUCT LIST - Liste des produits par famille et categorie
// URL dynamique : /femme → tous les produits Femme
//                 /femme/bijoux → les bijoux Femme
// Utilise les utils formatUrl pour convertir les slugs URL en noms BDD
// =============================================================

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { fromSlug } from "../utils/formatUrl";
import ProductView from "../components/ProductView/ProductView";
import "../styles/ProductList.css";
import { Header } from "../components/Header/Header";

// Listes des enums pour la conversion slug → nom BDD
const FAMILIES = [
  "Femme",
  "Homme",
  "Garcon",
  "Fille",
  "Bebe_fille",
  "Bebe_garcon",
  "Jouet",
  "Maison",
];
const CATEGORIES = [
  "Vetements",
  "Bijoux",
  "Chaussures",
  "Sacs",
  "Accessoires",
  "Sport",
  "Beaute",
  "Luminaire",
  "Tapis",
  "Decoration",
  "Art_de_la_table",
];

// Format attendu par le composant ProductView (mapping API → affichage)
interface Variation {
  _id?: string;
  color?: string;
  size?: string;
  stock: number;
  price: number;
}

interface ProductDisplay {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  variations: Variation[];
}

const ProductList: React.FC = () => {
  const { family: familySlug, category: categorySlug } = useParams();
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  // Convertir les slugs URL en noms BDD
  // "femme" → "Femme", "bebe-fille" → "Bebe_fille"
  const dbFamily = familySlug ? fromSlug(familySlug, FAMILIES) : null;
  const dbCategory = categorySlug ? fromSlug(categorySlug, CATEGORIES) : null;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Paramètres de filtrage pour l'API
        // Quand on clique "Voir tout" dans une famille : seulement family est défini (pas category)
        // Quand on clique sur une catégorie spécifique : family ET category sont définis
        const params: Record<string, string> = {
          status: "true", // Seulement les produits actifs (en vente)
        };

        // Filtrer par famille si présente (ex: "Femme")
        if (dbFamily) {
          params.family = dbFamily;
        }

        // Filtrer par catégorie SEULEMENT si présente dans l'URL
        // Si categorySlug est undefined (clic sur "Voir tout"), dbCategory sera null et ne sera pas ajouté
        if (dbCategory) {
          params.category = dbCategory;
        }

        const response = await api.get<{
          message: string;
          products: any[];
        }>("/products", { params });
        const list = (response.data?.products ?? []).filter(
          (p: any) => p && (p._id || p.id),
        );

        setProducts(
          list.map((p: any) => {
            const firstImage = p.images?.[0];
            const imageSrc =
              typeof firstImage === "string" && firstImage.trim()
                ? firstImage
                : products[0]?.image || "";
            // Calculer le prix minimum depuis les variations, ou utiliser 0 par défaut
            const variations = Array.isArray(p.variations) ? p.variations : [];
            const minPrice =
              variations.length > 0
                ? Math.min(...variations.map((v: Variation) => v.price ?? 0))
                : 0;

            return {
              id: String(p._id ?? p.id ?? ""),
              title: p.name ?? "",
              price: minPrice,
              image: imageSrc,
              description:
                typeof p.description === "string" ? p.description : "",
              variations: variations,
            };
          }),
        );
      } catch (err) {
        console.error("Erreur API getProducts", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [dbFamily, dbCategory]);

  // Etape 3 : affichage
  return (
    <div className="product-list-page">
      <header className="list-header">
        <h1 className="list-title">
          {dbFamily} {dbCategory ? "> " + dbCategory.replace("_", " ") : ""}
        </h1>
        <p className="product-count">{products.length} produits trouves</p>
      </header>

      <main className="product-grid-container">
        {loading ? (
          <div className="loader">Chargement des produits...</div>
        ) : (
          <div className="product-grid">
            {products.map(function (product) {
              return (
                <ProductView
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price || 0}
                  image={product.image || ""}
                  description={product.description || ""}
                  variations={product.variations || []}
                />
              );
            })}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="no-results">
            Aucun produit ne correspond a cette categorie pour le moment.
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductList;
