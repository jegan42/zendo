import Button from "../../Button/Button";
import "../PaiementModal/PaiementModal.css";

interface PaiementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function PaiementModal(props: PaiementModalProps) {
  if (!props.isOpen) {
    return null;
  }

  return (
    <div className="paiement-modal">
      <div className="paiement-modal-content">
        <h2>Détails de la carte</h2>
        <p>
          Les informations liées à la carte sont confidentielles et sécurisées.
        </p>
        <div className="paiement-modal-inputs">
          <input type="text" placeholder="Nom sur la carte" />
          <input type="text" placeholder="Numéro de carte" />
          <input type="text" placeholder="Date d'expiration (MM/AA)" />
          <input type="text" placeholder="CVV" />
        </div>
        <div className="paiement-modal-buttons">
          <Button onClick={props.onConfirm}>Utiliser cette carte</Button>
          <Button onClick={props.onClose}>Annuler</Button>
        </div>
      </div>
    </div>
  );
}

export default PaiementModal;
