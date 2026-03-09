import React, { useEffect, useState } from "react";
import "../styles/Paiement.css";
import { Header } from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import PaiementModal from "../components/Modal/PaiementModal/PaiementModal";
import api from "../services/api";

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
    const [order, setOrder] = useState<OrderItem[]>([]);
    const [address, setAddress] = useState<Address | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const userId = JSON.parse(localStorage.getItem("user") || "{}").id;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [orderRes, addressRes] = await Promise.all([
                    api.get<{ order: OrderItem[] }>("/orders"),
                    api.get<{ address: Address }>(`/address/${userId}`),
                ]);

                setOrder(orderRes.data.order || []);
                setAddress(addressRes.data.address || null);
            } catch (err: any) {
                setError(
                    err.message || "Erreur lors du chargement des données"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const subtotal = order.reduce(
        (sum, item) => sum + item.price * (item.quantity || 1),
        0
    );
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
                            {address.street}, {address.postalCode}{" "}
                            {address.city}, {address.country}
                        </p>
                    ) : (
                        <p className="section-content">
                            Aucune adresse disponible
                        </p>
                    )}
                </div>

                <div className="order-sum">
                    {order.map((item, index) => (
                        <div key={item._id} className={`article-${index + 1}`}>
                            <p className="section-title">{item.name}</p>
                            <p className="section-content">
                                {item.price} € x {item.quantity || 1}
                            </p>
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
                    <p
                        className="section-content"
                        onClick={() => setShowModal(true)}
                    >
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
