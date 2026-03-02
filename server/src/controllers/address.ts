import { Request, Response } from "express";
import Address from "../models/Address";

// UPSERT ADDRESS SHIPPING & BILLING(Create or Update)
// POST or PUT /api/address/save
async function upsertAddress(req: Request, res: Response) {
  try {
    const { userId } = req.params; // Récupéré depuis l'URL
    const { phone, street, postalCode, city, country, addressType } = req.body;

    if (!phone || !street || !postalCode || !city || !country) {
      return res.status(400).json({ 
        message: "Champs obligatoires manquants pour l'adresse",
        received: { phone, street, postalCode, city, country } 
      });
    }

    const address = await Address.findOneAndUpdate(
      { userId, addressType: addressType},
      { userId, phone, street, postalCode, city, country, addressType, isDefault: true },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({ message: `Adresse ${addressType} enregistrée`, address });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// RÉCUPÉRER L'ADRESSE SHIPPING & BILLING(GET)
// GET /api/address/:userId

async function getAddressByUserId(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    // On récupère TOUTES les adresses de l'utilisateur
    const addresses = await Address.find({ userId });

    // On renvoie le tableau (vide ou rempli)
    return res.status(200).json(addresses);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export { upsertAddress, getAddressByUserId};

