import React, { useEffect, useState } from "react";
import "../styles/Paiement.css";
import { Header } from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import PaiementModal from "../components/Modal/PaiementModal/PaiementModal";
import api from "../services/api";
import { useParams } from "react-router-dom";

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

function Paiement() {
  const [order, setOrder] = useState<any | null>(null);
  const [address, setAddress] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [orderRes, addressRes] = await Promise.all([
          api.get<{ order: any }>("/orders/" + id),
          api.get<{ address: any }>(`/address`),
        ]);

        setOrder(orderRes.data.order || []);
        console.log("Données de la commande chargées:", orderRes.data);
        setAddress(addressRes.data || null);
        console.log("Données de l'adresse chargées:", addressRes.data);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
        console.log(
          "Données de la commande et de l'adresse chargées",
          order,
          address,
        );
      }
    };

    fetchData();
  }, []);

  const subtotal = order?.totalAmount || 0;
  const shipping = 5; // tu peux le rendre dynamique si besoin
  const total = subtotal + shipping;

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="page-container">
      <Header />
      <div className="paiement-container">
        <div className="adress-section">
          <p className="section-title">Adresse de livraison</p>
          {address ? (
            <p className="section-content">
              {address[0].street}, {address[0].postalCode} {address[0].city},{" "}
              {address[0].country}
            </p>
          ) : (
            <p className="section-content">Aucune adresse enregistrée</p>
          )}
        </div>

        <div className="order-sum">
          {order.items.map((item: any, index: number) => (
            <div key={item.productName} className={`article-${index + 1}`}>
              <div className="article-image">
                <img
                  src={item.image || "/placeholder.png"}
                  alt={item.productName}
                />
              </div>
              <div className="article-info">
                <p className="section-title">{item.productName}</p>
                <p className="section-content">
                  {item.price} € x {item.quantity || 1}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="total-section">
          <h3 className="section-total">Sous-total</h3>
          <p className="section-total">{subtotal}€</p>
          <h3 className="section-total">Frais de livraison</h3>
          <p className="section-total">{shipping}€</p>
          <h3 className="section-total">Total</h3>
          <p className="section-total">{total}€</p>
        </div>

        <div className="payment-section">
          <p className="section-title">Méthode de paiement</p>
          <p className="section-content" onClick={() => setShowModal(true)}>
            Carte bancaire
          </p>
          <PaiementModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onConfirm={() => setShowModal(false)}
          />
        </div>

        <div className="confirm-section"></div>
        <Navbar />
      </div>
    </div>
  );
}

export default Paiement;
