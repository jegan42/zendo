import React from "react";
import "../styles/Paiement.css";
import { Header } from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";

function Paiement() {
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
          <div className="first-article">
            <p className="section-title">Article 1</p>
            <p className="section-content">T-shirt rouge - 20€</p>
          </div>
          <div className="first-article">
            <p className="section-title">Article 1</p>
            <p className="section-content">T-shirt rouge - 20€</p>
          </div>
          <div className="first-article">
            <p className="section-title">Article 1</p>
            <p className="section-content">T-shirt rouge - 20€</p>
          </div>
        </div>

        <div className="total-section">
          <p className="section-total">Sous-total</p>
          <p className="section-total">80€</p>
          <p className="section-total">Frais de livraison</p>
          <p className="section-total">5€</p>
          <p className="section-total">Total</p>
          <p className="section-total">85€</p>
        </div>

        <div className="payment-section">
          <p className="section-title">Methode de paiement</p>
          <p className="section-content">Carte bancaire</p>
        </div>

        <div className="confirm-section"></div>

        <Navbar />
      </div>
    </div>
  );
}

export default Paiement;
