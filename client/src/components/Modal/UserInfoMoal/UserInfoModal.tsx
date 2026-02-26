import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Button from "../../Button/Button";
import "./UserInfoModal.css"

interface UserInfosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserInfosModal = ({ isOpen, onClose }: UserInfosModalProps) => {
  const user = useSelector((state: any) => state.user.userInfo);

// États locaux pour permettre la modification
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  
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
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    // VALIDATION : Vérifier que les 3 champs ne sont pas vides
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert("Le prénom, le nom et l'adresse mail ne peuvent pas être vides.");
      return;
    }

    const fullPhone = `${address.countryCode}${address.phone}`;
    
    // Objet final prêt pour le backend
    const payload = {
      firstName,
      lastName,
      email,
      address: {
        ...address,
        phone: fullPhone,
        addressType: "shipping",
      }
    };

    console.log("Envoi au Backend :", payload);
    /* CONNEXION BACKEND :
       Ici, vous devrez appeler votre route :
       await axios.post("http://localhost:5001/api/address", payload);
    */
    
    alert("Informations mises à jour avec succès !");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Informations personnelles</h2>

        {/* SECTION 1 : INFORMATIONS (Redux) */}
        <div className="info-section">
          <div className="input-group info-modal">
            <label>Prénom</label>
            <input 
              type="text" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Votre prénom"
            />
          </div>
          <div className="input-group info-modal">
            <label>Nom</label>
            <input 
              type="text" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Votre nom"
            />
          </div>
          <div className="input-group info-modal">
            <label>Adresse mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre adresse mail" />
          </div>
        </div>

        <hr />

        {/* SECTION 2 : ADRESSE (À compléter) */}
        <div className="info-section">
          <h3>Adresse</h3>
          
          <div className="input-group info-modal">
            <label>Pays</label>
            <input 
              type="text" 
              placeholder="Ex: France" 
              onChange={(e) => setAddress({...address, country: e.target.value})}
            />
          </div>

          <div className="input-group info-modal">
            <label>Téléphone</label>
            <div className="phone-input-container">
              <select 
                value={address.countryCode} 
                onChange={(e) => setAddress({...address, countryCode: e.target.value})}
              >
                <option value="+33">+33 (FR)</option>
                <option value="+32">+32 (BE)</option>
                <option value="+41">+41 (CH)</option>
                <option value="+1">+1 (US)</option>
              </select>
              <input 
                type="tel" 
                placeholder="612345678" 
                onChange={(e) => setAddress({...address, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="input-group info-modal">
            <label>Rue et numéro</label>
            <input 
              type="text" 
              placeholder="15 rue de la Paix" 
              onChange={(e) => setAddress({...address, street: e.target.value})}
            />
          </div>

          <div className="input-row">
            <div className="input-group info-modal">
              <label>Ville</label>
              <input 
                type="text" 
                placeholder="Paris" 
                onChange={(e) => setAddress({...address, city: e.target.value})}
              />
            </div>
            <div className="input-group info-modal">
              <label>Code Postal</label>
              <input 
                type="text" 
                placeholder="75000" 
                onChange={(e) => setAddress({...address, postalCode: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={handleSave}>Enregistrer</Button>
        </div>
      </div>
    </div>
  );
};

export default UserInfosModal;