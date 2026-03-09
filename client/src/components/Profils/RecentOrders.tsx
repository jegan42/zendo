import React from "react";
import "./RecentOrders.css";
import img from "../../asset/Logo/product.png";

  // SIMULATION : Liste d'articles provenant normalement de GET /api/orders
 const RecentOrders = () => {
  // Simulation des données (sera remplacé par route GET plus tard)
  const items = [
    { id: 1, name: "McWay Falls", date: "2 weeks ago", img: img },
    { id: 2, name: "Blue Mesh", date: "1 month ago", img: img },
    { id: 3, name: "Sunset", date: "3 months ago", img: img },
    { id: 4, name: "Ocean", date: "5 months ago", img: img },
  ];

  /* TODO PLUS TARD :
    useEffect(() => {
      const fetchOrders = async () => {
        try {
          const response = await api.get("/orders/user"); // ton endpoint réel à la place de ...
          setOrders(response.data);
        } catch (error) {
          console.error("Erreur lors du chargement des commandes :", error);
          setOrders([]); // optionnel : reset si erreur
        }
      };

      fetchOrders();
    }, []);
  */

  return (
    <div className="recent-order-section">
      <h3 className="section-title">Achats récents</h3>
      
      {/* C'est ce div qui gère la ligne unique et le scroll horizontal */}
      <div className="white-card-scroll">
        {items.map((item) => (
          <div key={item.id} className="order-item">
            <div className="order-image-wrapper">
              <img src={item.img} alt={item.name} className="order-img" />
              <div className="order-name-overlay">{item.name}</div>
            </div>
            <p className="order-date">{item.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RecentOrders;