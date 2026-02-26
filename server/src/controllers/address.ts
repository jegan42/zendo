import { Request, Response } from "express";
import Address from "../models/Address";

// UPSERT ADDRESS (Create or Update)
// POST or PUT /api/address/save
async function upsertAddress(req: Request, res: Response) {
  try {
    const { userId } = req.params; // Récupéré depuis l'URL
    const { phone, street, postalCode, city, country, addressType } = req.body;

    const address = await Address.findOneAndUpdate(
      { userId, addressType: addressType || "shipping" },
      { userId, phone, street, postalCode, city, country, addressType, isDefault: true },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: "Adresse enregistrée", address });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export { upsertAddress };