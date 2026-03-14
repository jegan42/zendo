import React, { useEffect, useState } from "react";
import "./RecentOrders.css";
import { getRecentProducts} from "../../services/orderService";
import { formatDistanceToNow } from "date-fns"; //  pour les dates "il y a X jours"
import { fr } from "date-fns/locale";

  const RecentOrders = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getRecentProducts();
        console.log("Produits reçus du backend:", data); // Vérifie ici si le tableau est vide
        setProducts(data);
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="recent-order-section">Chargement...</div>;

  return (
    <div className="recent-order-section">
      <h3 className="section-title">Achats récents</h3>
      
      <div className="white-card-scroll">
        {products && products.length > 0 ? (
          products.map((item) => (
            <div key={item.id} className="order-item">
              <div className="order-image-wrapper">
                <img 
                  src={item.img} 
                  alt={item.name} 
                  className="order-img"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png" }} 
                />
                <div className="order-name-overlay">{item.name}</div>
              </div>
              <p className="order-date">
                {item.date ? formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: fr }) : "Date inconnue"}
              </p>
            </div>
          ))
        ) : (
          <p className="order-date" style={{ padding: "20px" }}>Aucun achat récent trouvé.</p>
        )}
      </div>
    </div>
  );
};

export default RecentOrders;