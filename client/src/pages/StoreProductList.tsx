import "../styles/Pages.css";
import { Header } from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";
import { useSearchParams } from "react-router-dom";

interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  family: string;
  category: string;
  material: string[];
  madeInFrance: boolean;
  reference: string;
  status: boolean;
  sellerId: string;
  // ajouter les champs nécessaires
}

interface StoreProductListProps {
  sellerId: string;
}

function StoreProductList({ sellerId }: StoreProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q");
  const [variations, setVariations] = useState<any[]>([
    {
      color: "",
      size: "",
      quantity: 0,
    },
  ]);

  useEffect(() => {
    let isCancelled = false;
    // fonction pour récupérer la liste des produits d'un vendeur depuis l'API
    const fetchProducts = async () => {
      // je mets loading à true et error à null avant de faire la requete
      setLoading(true);
      setError(null);
      // j'envoie une requete GET à l'API pour récupérer les produits du vendeur
      //${sellerId}
      try {
        const response = await api.get<{ products: Product[] }>(
          `/products?sellerId=6997803eb5d8a55a2686ec58`,
        );
        // si la requete est réussie, je mets les produits dans le state et loading à false
        if (!isCancelled) {
          setProducts(response.data.products || []);
          console.log("Produits récupérés:", response.data.products);
        }
      } catch (err: any) {
        if (!isCancelled) setError(err.message || "Erreur lors du fetch");
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isCancelled = true; // annule la mise à jour si le composant se démonte
    };
  }, [sellerId]);

  return (
    <div className="page-container">
      <Header />
      <div className="store-container">
        <h1 className="page-title">Liste des produits</h1>
        <Navbar />

        {loading && <p>Chargement des produits...</p>}
        {error && <p className="error">{error}</p>}

        <ul>
          {products.map((product) => (
            <li key={product._id}>
              <img
                src={product.images[0]} // afficher la première image du produit
                alt={product.name}
              />
              <p>{product.description}</p>
              <p>
                {product.name} - {product.description} €
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default StoreProductList;
