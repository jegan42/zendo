import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Button from "../../Button/Button";
import { setCredentials } from "../../../reducers/user";
import "./UserInfoModal.css";

interface UserInfosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserInfosModal = ({ isOpen, onClose }: UserInfosModalProps) => {
  const dispatch = useDispatch();
  // Récupération des infos et du token depuis Redux
  const { userInfo: user, token } = useSelector((state: any) => state.user);

  // États locaux pour permettre la modification
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // États locaux pour l'adresse
  const [address, setAddress] = useState({
    country: "",
    countryCode: "+33",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
  });
  // On remplit les champs dès que la Modal s'ouvre ou que Redux change
  useEffect(() => {
    const loadUserData = async () => {
    // 1. Remplissage des infos utilisateur (Redux)
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    };
    // 2. Récupération de l'adresse depuis le Backend
    if (isOpen && (user?._id || token)) {
      try {
        // Récupération de l'ID via user ou décodage token
        let userId = user?._id;
        if (!userId && token) {
          const decoded: any = jwtDecode(token);
          userId = decoded.id;
        }

        const response = await axios.get(`http://localhost:5001/api/address/${userId}`);
        const allAddresses = response.data; // C'est le tableau d'adresses

        // 3. Filtrage côté Front pour l'adresse de type "shipping"
        if (Array.isArray(allAddresses)) {
          const shippingAddr = allAddresses.find(
            (addr: any) => addr.addressType === "shipping"
          );

          if (shippingAddr) {
            setAddress({
              country: shippingAddr.country || "",
              countryCode: shippingAddr.phone?.startsWith("+") 
                ? shippingAddr.phone.substring(0, 3) 
                : "+33",
              phone: shippingAddr.phone?.startsWith("+") 
                ? shippingAddr.phone.substring(3) 
                : shippingAddr.phone || "",
              street: shippingAddr.street || "",
              city: shippingAddr.city || "",
              postalCode: shippingAddr.postalCode || "",
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'adresse :", error);
      }
    }
  };
    loadUserData();
  }, [user, isOpen,token]);

  const handleSave = async () => {
    // 1. RÉCUPÉRATION DE L'ID (via Redux ou via Décodage du Token)
    let userId = user?._id;

    // Si l'id n'est pas dans l'objet user, on le décode du token
    if (!userId && token) {
      try {
        const decoded: any = jwtDecode(token);
        userId = decoded.id || decoded.userId || decoded.sub;
      } catch (e) {
        console.error("Erreur de décodage du token", e);
      }
    }

    // 2. VALIDATION : Seul l'email est requis
    if (!email.trim()) {
      alert("L'adresse mail ne peut pas être vide.");
      return;
    }
    try {
      // 2. APPEL API USER : Uniquement avec l'email
    const userPromise = axios.put(
        `http://localhost:5001/api/users/${userId}`,
        { email } // On n'envoie plus le nom/prénom
      );

      // 3. APPEL API : Enregistrement/Update Adresse (POST /api/address/save/:userId)
      // On n'envoie l'adresse que si les champs sont remplis
      let addressPromise = Promise.resolve(null);
      if (address.street && address.city && address.phone) {
        addressPromise = axios.post(
          `http://localhost:5001/api/address/save/${userId}`,
          {
            phone: `${address.countryCode}${address.phone}`,
            street: address.street,
            postalCode: address.postalCode,
            city: address.city,
            country: address.country,
            addressType: "shipping", // Définit le type
          },
        );
      }

      // Exécution des deux requêtes en parallèle
      const [userRes] = await Promise.all([userPromise, addressPromise]);

      // 4. MISE À JOUR REDUX : Pour que le reste du site voit les changements
      dispatch(
        setCredentials({
          user: userRes.data.user,
          token: token,
        }),
      );

      alert("Informations et adresse enregistrées avec succès !");
      onClose();
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert(
        error.response?.data?.message ||
          "Une erreur est survenue lors de l'enregistrement.",
      );
    }
  };
  // condition de sortie de la Modal
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content info-modal-container">
        <button 
          className="modal-close-button" 
          onClick={onClose} 
          aria-label="Fermer"
        >
          &times;
        </button>
        <h2 className="modal-title">Informations personnelles</h2>
        
        <div className="info-section-wrapper">
          <div className="info-section">
            <h3>Mes informations</h3>
            <div className="input-group">
              <label>Prénom</label>
              <input
                type="text"
                value={firstName}
                disabled // Empêche la modification
                className="disabled-input"
              />
            </div>
            <div className="input-group">
              <label>Nom</label>
              <input
                type="text"
                value={lastName}
                disabled // Empêche la modification
                className="disabled-input"
              />
            </div>
            <div className="input-group">
              <label>Adresse mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse mail"
              />
            </div>
          </div>


          <div className="info-section">
            <h3>Adresse</h3>
            <div className="input-group">
              <label>Pays</label>
              <input
                type="text"
                value={address.country}
                placeholder="Ex: France"
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Téléphone</label>
              <div className="phone-input-row">
                <select
                  value={address.countryCode}
                  onChange={(e) => setAddress({ ...address, countryCode: e.target.value })}
                >
                  <option value="+33">+33 (FR)</option>
                  <option value="+32">+32 (BE)</option>
                  <option value="+41">+41 (CH)</option>
                </select>
                <input
                  type="tel"
                  value={address.phone}
                  placeholder="612345678"
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Rue et numéro</label>
              <input
                type="text"
                value={address.street}
                placeholder="15 rue de la Paix"
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
              />
            </div>

            <div className="input-row-flex">
              <div className="input-group half">
                <label>Ville</label>
                <input
                  type="text"
                  value={address.city}
                  placeholder="Paris"
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
              </div>
              <div className="input-group half">
                <label>Code Postal</label>
                <input
                  type="text"
                  value={address.postalCode}
                  placeholder="75000"
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Les boutons doivent être en dehors du wrapper de scroll pour rester visibles */}
        <div className="modal-actions">
          <Button variant="primary" onClick={handleSave}>
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserInfosModal;
