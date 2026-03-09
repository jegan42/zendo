import "../styles/Pages.css";
import { Header } from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import { useEffect, useState } from "react";

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
        const controller = new AbortController(); // pour annuler si le composant se démonte
        setLoading(true);
        setError(null);

        fetch(`http://localhost:5001/api/products?sellerId=${sellerId}`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
            },
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) throw new Error("Erreur lors du fetch");
                return response.json();
            })
            .then((data) => setProducts(data.products || []))
            .catch((err) => {
                if (err.name !== "AbortError") setError(err.message);
            })
            .finally(() => setLoading(false));

        return () => controller.abort(); // annule la requête si on quitte la page
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
