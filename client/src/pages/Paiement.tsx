import React from "react";
import "../styles/Paiement.css";
import { Header } from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";

function Paiement() {
  return (
    <div className="page-container">
      <Header />
      <h1>Page de paiement</h1>
      <Navbar />
    </div>
  );
}

export default Paiement;
