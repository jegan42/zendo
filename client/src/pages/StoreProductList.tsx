import React, { use } from "react";
import "../styles/Pages.css";
import { Header } from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import { useEffect, useState } from "react";

function StoreProductList(sellerId: string) {
  useEffect(() => {
    // fetch les produits du magasin de l'utilisateur
    fetch(`http://localhost:5001/api/products?sellerId=${sellerId}`, {
      method: "GET",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then((response) => response.json())
      .then((data) => {
        const products = data.products || [];
        console.log(products);
      });
  }, [sellerId]);
  return (
    <div className="page-container">
      <Header />
      <div className="store-container">
        <h1 className="page-title">Liste des produits</h1>

        <Navbar />
      </div>
    </div>
  );
}

export default StoreProductList;
