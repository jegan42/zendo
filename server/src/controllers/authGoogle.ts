import { OAuth2Client } from "google-auth-library";
import User from "../models/User";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function googleAuth(req: Request, res: Response) {
    try {
        const { tokenId } = req.body;

        // Vérification du token Google
        const ticket = await googleClient.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        const email = payload?.email;
        const googleId = payload?.sub;
        const firstName = payload?.given_name;
        const lastName = payload?.family_name;
        const avatar = payload?.picture;

        if (!email) {
            return res.status(400).json({
                message: "Email Google non trouvé",
            });
        }

        let user = await User.findOne({ email });

        // 1️⃣ Si l'utilisateur existe déjà
        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                user.emailVerified = true;
                await user.save();
            }
        }

        // 2️⃣ Sinon on crée le compte
        else {
            user = await User.create({
                firstName: firstName || "GoogleUser",
                lastName: lastName || "",
                email,
                googleId,
                avatar,
                password: "GOOGLE_AUTH",
                emailVerified: true,
            });
        }

        // Création du JWT
        const jwtToken = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Connexion Google réussie",
            token: jwtToken,
            user,
        });
    } catch (error) {
        console.error("Erreur Google Auth:", error);

        return res.status(500).json({
            message: "Erreur authentification Google",
        });
    }
}

export { googleAuth };
