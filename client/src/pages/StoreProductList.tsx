import "../styles/Pages.css";
import { Header } from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";

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

    useEffect(() => {
        let isCancelled = false;

        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get<{ products: Product[] }>(
                    `/products?sellerId=${sellerId}`
                );

                if (!isCancelled) {
                    setProducts(response.data.products || []);
                }
            } catch (err: any) {
                if (!isCancelled)
                    setError(err.message || "Erreur lors du fetch");
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
                            {product.name} - {product.description} €
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default StoreProductList;
