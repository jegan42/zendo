import React from "react";
import "./OrderPreview.css"

interface PreviewProps {
  orderId: string;
  date: string;
  total: string;
  status: string;
  packages: string[];
}

const OrderPreview = ({ orderId, date, total, status, packages }: PreviewProps) => {
  return (
    <>
      <div className="order-preview-card">
        {/* Section ID + Bouton sur la ligne du dessous */}
        <div className="order-id-section">
          <div className="info-group">
            <span className="info-label">Numéro de commande:</span>
            <span className="info-value">{orderId}</span>
          </div>
          <div className="order-action-row">
            <button className="btn-view-order">Voir la commande</button>
          </div>
        </div>

        {/* Grille Date et Total */}
        <div className="order-grid-details">
          <div className="info-group">
            <span className="info-label">Date de commande:</span>
            <span className="info-value">{date}</span>
          </div>
          <div className="info-group text-right">
            <span className="info-label">Total:</span>
            <span className="info-value price-large">{total}</span>
          </div>
        </div>

        {/* Statut du paiement */}
        <div className="info-group">
          <span className="info-label">Statut du paiement:</span>
          <span className="info-value">{status}</span>
        </div>

        {/* Liste des colis et suivi */}
        <div className="packages-section">
          {packages.map((pkg, index) => (
            <div key={index} className="package-row">
              <span>{pkg} :</span>
              <button className="btn-track">Suivre -{">"}</button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Séparateur ajouté ici pour garantir sa présence sur mobile */}
      <hr className="order-divider" />
    </>
  );
};

export default OrderPreview;