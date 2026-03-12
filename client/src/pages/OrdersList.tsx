import React, { useState, useEffect } from "react";
import "../styles/OrdersList.css";
import OrderPreview from "../components/OrdersList/OrderPreview";
import { Header } from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import { getUserOrders} from "../services/orderService";


function OrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getUserOrders();
        setOrders(data);
      } catch (err) {
        console.error("Erreur lors du chargement des commandes", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="page-container">
      <Header />
     
      <main className="page-content orders-page">
        <div className="orders-wrapper">
          <div className="orders-grid">
            {loading ? (
              <p style={{ textAlign: "center", marginTop: "20px" }}>Chargement de vos commandes...</p>
            ) : orders.length > 0 ? (
              orders.map((order) => {
                // Logique Colis X sur Y
                const totalPackages = order.shopNames.length;
                const packageLabels = order.shopNames.map((shopName: string, index: number) => 
                  `Colis ${index + 1} sur ${totalPackages} : ${shopName}`
                );

                return (
                  <OrderPreview
                    key={order._id}
                    orderId={order.orderNumber}
                    // Formatage de la date ISO en FR
                    date={new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    total={`${order.totalAmount} €`}
                    status={order.status === "paid" ? "Réglé" : order.status}
                    packages={packageLabels}
                  />
                );
              })
            ) : (
              <p style={{ textAlign: "center", marginTop: "20px" }}>Vous n'avez pas encore de commandes.</p>
            )}
          </div>
        </div>
      </main>
      <Navbar />
    </div>
  );
}
export default OrdersList;