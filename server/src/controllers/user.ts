import { Request, Response } from "express";
import User from "../models/User";

// UPDATE USER PROFILE BY ID
async function updateProfile(req: Request, res: Response) {
  try {
    // Étape 1 : Récupérer l'ID depuis l'URL
    const { id } = req.params;

    // Étape 2 : Récupérer les données de modification
    const { email, role } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ message: "L'adresse email est obligatoire" });
    }

    // Préparer l'objet de mise à jour
    const updateData: any = { email };
    if (role) updateData.role = role; // On n'ajoute role que s'il est présent dans la requête

    // Étape 3 : Mise à jour via l'ID de l'URL
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.status(200).json({
      message: "Profil mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur updateProfile:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export { updateProfile };
