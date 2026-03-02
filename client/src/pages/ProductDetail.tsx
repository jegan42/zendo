import React, { useState, useEffect } from "react";
import Button from "../components/Button/Button";
import { Header } from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import "../styles/ProductDetail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { data, useParams } from "react-router-dom";
import { Message } from "../components/Message/Message";
import { addToCart } from "../services/cartService";

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
  // set la donnée favorie pour afficher le coeur plein ou vide
  const [isFavori, setIsFavori] = useState(false);
  // set les favoris de l'utilisateur pour vérifier si le produit est dans les favoris ou pas
  const [userFavori, setUserFavori] = useState([]);
  // ajoute une variable d'état pour stocker les produits du panier de l'utilisateur
  const [userCart, setUserCart] = useState<string[]>([]);
  // Récupère l'ID de la route
  const { id } = useParams();
  // set le message d'ajout ou de suppression du panier
  const [message, setMessage] = useState("");
  // set l'état pour afficher ou non le modal de sélection des variations
  const [showModal, setShowModal] = useState(false);

  // useEffect pour fetch les données du produit et vérifier si le produit est dans les favoris ou pas
  useEffect(() => {
    // si je n'ai pas d'id, je ne fetch rien
    if (!id) return;
    // fetch les données du produit
    fetch(`http://localhost:5001/api/products/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setProduct(data.product);
        setVariations(data.variations || []);
        console.log(data.variations);
      })
      .catch((error) => console.error("Erreur fetch produit:", error));
    // fetch les favoris de l'utilisateur pour vérifier si le produit est dans les favoris ou pas
    fetch(`http://localhost:5001/api/favoris`, {
      method: "GET",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then((response) => response.json())
      .then((data) => {
        setUserFavori(data.favoris || []);
        if (
          data.favoris &&
          data.favoris.find((favori: any) => favori._id === id)
        ) {
          setIsFavori(true);
        }
      });
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

  const handleFavoriClick = () => {
    // si je n'ai pas d'id je ne fetch pas
    if (!id) return;
    // set des états favori pour afficher le message d'ajout ou de suppression des favoris et pour afficher le coeur plein ou vide
    const previousState = isFavori;
    const nextState = !isFavori;

    setIsFavori(nextState);
    // si le produit était déjà dans les favoris, je le supprime, sinon je l'ajoute
    if (previousState) {
      fetch(`http://localhost:5001/api/favoris/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setError(data.message);
        });
    } else {
      fetch(`http://localhost:5001/api/favoris/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setError(data.message);
        });
    }
  };

  // fonction pour ajouter un produit dans le panier de l'utilisateur
  const handleAddCartClick = (
    color: string,
    size: string,
    quantity: number,
  ) => {
    // si je n'ai pas d'id je ne fetch pas
    if (!product?._id) return;
    // si le modal de sélection des variations est ouvert, j'ajoute le produit au panier de l'utilisateur avec les variations sélectionnées
    if (showModal) {
      addToCart(product._id, color, size, quantity).then((message) => {
        setError(message);
      });
    }
  };

  return (
    <div>
      <Header />

      <div className="product-detail-container">
        <div className="product-image">
          <img src={firstImage()} alt="Product" />
        </div>

        <div className="product-info">
          <h1 className="product-title">{product?.name || "Produit"}</h1>
          <p className="product-price">Prix : {product?.price || 0}€</p>

          <FontAwesomeIcon
            icon={faHeart}
            onClick={handleFavoriClick}
            style={isFavori ? { color: "#E9BE59" } : {}}
            className="heart-icon"
          />
        </div>

        <Message message={error} variant="error" />

        <div className="product-smallImage">
          <img src={smallImage()} alt="Product" />
        </div>

        <div className="product-description-container">
          <p className="product-description">{product?.description || ""}</p>
        </div>
        <ProductModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={({ color, size, quantity }: any) => {
            handleAddCartClick(color, size, quantity);
          }}
          title="Choisissez une variation"
          variations={variations}
        />
        <Button onClick={() => setShowModal(true)}>Ajouter au panier</Button>
      </div>

      <Navbar />
    </div>
  );
}

export default ProductDetail;
