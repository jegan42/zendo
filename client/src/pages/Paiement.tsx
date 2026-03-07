import React from "react";
import "../styles/Paiement.css";
import { Header } from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PaiementModal from "../components/Modal/PaiementModal/PaiementModal";

function Paiement() {
  const [order, setOrder] = useState<any[]>([]);
  const [address, setAddress] = useState<any>({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // fetch la commande de l'utilisateur
    fetch(`http://localhost:5001/api/orders`, {
      method: "GET",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then((response) => response.json())
      .then((data) => {
        const order = data.order || [];
        setOrder(order);
        console.log(order);
      });
    // on recupere l'id de l'utilisateur dans le local storage pour fetch son adresse de livraison
    const userId = JSON.parse(localStorage.getItem("user") || "{}").id;
    fetch(`http://localhost:5001/api/address/${userId}`, {
      method: "GET",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then((response) => response.json())
      .then((data) => {
        const address = data.address || {};
        setAddress(address);
        console.log(address);
      });
  }, []);

  return (
    <div className="page-container">
      <Header />
      <div className="paiement-container">
        <div className="adress-section">
          <p className="section-title">Adresse de livraison</p>
          <p className="section-content">123 rue de la paix, 75000 Paris</p>
        </div>

        <div className="order-sum">
          <div className="first-article">
            <p className="section-title">Article 1</p>
            <p className="section-content">T-shirt rouge - 20€</p>
          </div>
          <div className="second-article">
            <p className="section-title">Article 2</p>
            <p className="section-content">T-shirt rouge - 20€</p>
          </div>
          <div className="third-article">
            <p className="section-title">Article 3</p>
            <p className="section-content">T-shirt rouge - 20€</p>
          </div>
          <div className="fourth-article">
            <p className="section-title">Article 4</p>
            <p className="section-content">T-shirt rouge - 20€</p>
          </div>
        </div>

        <div className="total-section">
          <h3 className="section-total">Sous-total</h3>
          <p className="section-total">80€</p>
          <h3 className="section-total">Frais de livraison</h3>
          <p className="section-total">5€</p>
          <h3 className="section-total">Total</h3>
          <p className="section-total">85€</p>
        </div>

        <div className="payment-section">
          <p className="section-title">Methode de paiement</p>
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
