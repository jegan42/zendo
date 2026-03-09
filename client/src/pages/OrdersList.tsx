import React, { useState } from "react";
import "../styles/OrdersList.css";
import OrderPreview from "../components/OrdersList/OrderPreview";
import { Header } from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import { Link } from "react-router-dom";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addToCart } from "../services/cartService";
import { Message } from "../components/Message/Message";

function OrdersList() {
  const [selectedPeriod, setSelectedPeriod] = useState("6 derniers mois");

  // TODO: Intégrer l'appel API ici plus tard avec selectedPeriod
  
  return (
    <div className="page-container">
      <Header />
     
      <main className="page-content orders-page">
        <div className="orders-wrapper">
          <div className="orders-grid">
            <OrderPreview
              orderId="17289300028272"
              date="12/11/2025"
              total="130 €"
              status="Réglé"
              packages={["Colis 1 sur 2", "Colis 2 sur 2"]}
            />

            <OrderPreview
              orderId="1283037272929373"
              date="05/11/2025"
              total="45 €"
              status="Réglé"
              packages={["Colis 1 sur 1"]}
            />
          </div>
        </div>
      </main>
      <Navbar />
    </div>
  );
}

export default OrdersList;
