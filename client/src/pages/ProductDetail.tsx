import React, { useState, useEffect } from "react";
import Button from "../components/Button/Button";
import { Header } from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import "../styles/Pages.css";
import "../styles/ProductDetail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { Message } from "../components/Message/Message";
import { addToCart } from "../services/cartService";
import api from "../services/api";

function ProductDetail() {
    // ETATS & HOOKS

    // permet d'afficher le message d'ajout ou de suppression des favoris
    const [error, setError] = useState("");
    // set les données nécessaires à la page product detail
    const [product, setProduct] = useState<any>({
        images: [],
        name: "",
        price: 0,
        description: "",
        _id: "",
    });
    // set les variations du produit
    const [variations, setVariations] = useState<any[]>([
        {
            color: "",
            size: "",
            quantity: 0,
        },
    ]);
    // set la donnée favori pour afficher le coeur plein ou vide
    const [isFavori, setIsFavori] = useState(false);
    // set les favoris de l'utilisateur pour vérifier si le produit est dans les favoris ou pas
    const [userFavori, setUserFavori] = useState([]);
    // ajoute une variable d'état pour stocker les produits du panier de l'utilisateur
    const [userCart, setUserCart] = useState<string[]>([]);
    // Récupère l'ID de la route
    const { id } = useParams();
    // set le message d'ajout ou de suppression du panier
    const [message, setMessage] = useState("");
    // set l'état pour stocker la couleur sélectionnée par l'utilisateur
    const [selectedColor, setSelectedColor] = useState("");
    // set l'état pour stocker la taille sélectionnée par l'utilisateur
    const [selectedSize, setSelectedSize] = useState("");
    // set l'état pour stocker la quantité sélectionnée par l'utilisateur
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    // useEffect pour fetch les données du produit et vérifier si le produit est dans les favoris ou pas
    useEffect(() => {
        // si je n'ai pas d'id, je ne fetch rien
        if (!id) return;
        // fetch les données du produit
        async function fetchData() {
            try {
                // fetch produit
                const productResponse = await api.get(`/products/${id}`);
                setProduct(productResponse.data.product);
                setVariations(productResponse.data.variations || []);
                console.log(productResponse.data.variations);

                // fetch favoris utilisateur
                const favorisResponse = await api.get("/favoris");
                const favoris = favorisResponse.data.favoris || [];
                setUserFavori(favoris);

                // vérifier si le produit est dans les favoris
                setIsFavori(favoris.some((favori: any) => favori._id === id));
            } catch (error) {
                console.error("Erreur fetch produit ou favoris:", error);
            }
        }

        fetchData();
    }, [id]);

    // fonction pour récupérer la première image du produit
    const firstImage = () => {
        if (product?.images && product.images.length > 0) {
            return product.images[0];
        }
        return "";
    };

    // fonction pour récupérer la deuxième image du produit si elle existe, sinon la première image
    const smallImage = () => {
        if (!product?.images) return "";
        for (let i = 1; i < product.images.length; i++) {
            if (product.images[i]) {
                return product.images[i];
            }
        }
        return "";
    };

    const handleFavoriClick = async () => {
        if (!id) return;

        const previousState = isFavori;
        const nextState = !isFavori;
        setIsFavori(nextState); // mise à jour immédiate pour l'UI

        try {
            let response;
            if (previousState) {
                // suppression du favori
                response = await api.delete(`/favoris/${id}`);
            } else {
                // ajout du favori
                response = await api.post(`/favoris/${id}`);
            }
            setError(response.data.message); // message serveur
        } catch (err: any) {
            console.error("Erreur favoris:", err);
            setError(
                err.response?.data?.message ||
                    "Erreur lors de la mise à jour des favoris"
            );
            // rollback si erreur
            setIsFavori(previousState);
        }
    };

    // Pour chaque variation du produit, on recupere les couleurs et les tailles disponibles pour les afficher dans la modal
    // On utilise un Set pour ne pas avoir de doublons dans les listes de couleurs et tailles
    const colors = [...new Set(variations.map((variation) => variation.color))];
    const sizes = [...new Set(variations.map((variation) => variation.size))];

    const choix = new Map<string, string[]>();
    // je parcours les variations du produit pour construire une map des choix possibles : { "Rouge" => ["S", "M"], "Bleu" => ["M", "L"] }
    for (let i = 0; i < variations.length; i++) {
        const variation = variations[i];
        // si la couleur n'est pas encore dans la map, je l'ajoute avec une liste de tailles vide
        if (!choix.has(variation.color)) {
            choix.set(variation.color, []);
        }
        // j'ajoute la taille de la variation à la liste des tailles disponibles pour cette couleur
        const existingSizes = choix.get(variation.color) || [];
        // je vérifie que la taille n'est pas déjà dans la liste avant de l'ajouter
        if (!existingSizes.includes(variation.size)) {
            existingSizes.push(variation.size);
            choix.set(variation.color, existingSizes);
        }
    }

    // fonction pour vérifier si une taille est disponible pour la couleur sélectionnée
    function sizeDisponible(size: string) {
        // si aucune couleur n'est sélectionnée, toutes les tailles sont disponibles
        if (!selectedColor) {
            return true;
        }
        // je vérifie dans la map des choix si la taille est disponible pour la couleur sélectionnée
        return choix.get(selectedColor)?.includes(size) || false;
    }

    // fonction pour vérifier si une couleur est disponible pour la taille sélectionnée
    function colorDisponible(color: string) {
        console.log("Vérification disponibilité couleur :", choix);
        return selectedSize === "" || choix.get(color)?.includes(selectedSize);
    }

    // fonction qui retourne les options de tailles disponibles pour la couleur sélectionnée
    const disponibleSizes = () => {
        return sizes.filter(sizeDisponible).map((size) => (
            <option key={size} value={size}>
                {size}
            </option>
        ));
    };

    // fonction qui retourne les options de couleurs disponibles pour le produit
    const disponibleColors = () => {
        return colors.filter(colorDisponible).map((color) => (
            <option key={color} value={color}>
                {color}
            </option>
        ));
    };

    const handleIncreaseQuantity = () => {
        if (selectedQuantity < 10) {
            setSelectedQuantity(selectedQuantity + 1);
        }
    };
    const handleDecreaseQuantity = () => {
        if (selectedQuantity > 1) {
            setSelectedQuantity(selectedQuantity - 1);
        }
    };

    // fonction pour ajouter un produit dans le panier de l'utilisateur
    const handleAddCartClick = (
        color: string,
        size: string,
        quantity: number
    ) => {
        // si je n'ai pas d'id je ne fetch pas
        if (!product?._id) return;

        addToCart(product._id, color, size, quantity).then((message) => {
            setError(message);
        });
    };

    return (
        <div className="page-container">
            <Header />

            <div className="page-content">
                <div className="image-container">
                    <img
                        className="product-main-image"
                        src={firstImage()}
                        alt="Product"
                    />
                    <FontAwesomeIcon
                        icon={faHeart}
                        onClick={handleFavoriClick}
                        style={isFavori ? { color: "#E9BE59" } : {}}
                        className="heart-icon"
                    />
                </div>

                <div className="pd-header">
                    <h2>{product?.name || "Produit"}</h2>
                    <h2>{product?.price || 0}€</h2>
                </div>

                <Message message={error} variant="error" />

                <div>
                    <img src={smallImage()} alt="Product" />
                </div>

                <div>
                    <h3>A propos</h3>
                    <p>{product?.description || ""}</p>
                </div>
                <div className="product-variation">
                    <select
                        className="variation-list"
                        onChange={(e) => setSelectedColor(e.target.value)}
                    >
                        <option value="">
                            ---Veuillez choisir une couleur---
                        </option>
                        {disponibleColors()}
                    </select>
                    <select
                        className="variation-list"
                        onChange={(e) => setSelectedSize(e.target.value)}
                    >
                        <option value="">
                            ---Veuillez choisir une taille---
                        </option>
                        {disponibleSizes()}
                    </select>
                </div>
                <div className="product-quantity">
                    <button onClick={handleDecreaseQuantity}>-</button>
                    <span>{selectedQuantity}</span>
                    <button onClick={handleIncreaseQuantity}>+</button>
                    <Button
                        onClick={() =>
                            handleAddCartClick(
                                selectedColor,
                                selectedSize,
                                selectedQuantity
                            )
                        }
                    >
                        Ajouter au panier
                    </Button>
                </div>
            </div>

            <Navbar />
        </div>
    );
}

export default ProductDetail;
