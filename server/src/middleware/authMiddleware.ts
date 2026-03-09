import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Recupere l'id du user a partir du token JWT dans les headers
// Retourne l'id du user ou null si le token est absent ou invalide
export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Etape 1 : recupere le token d'authorization dans les headers
    const token = req.header("authorization")?.replace("Bearer ", "");

    // Etape 2 : si pas de token, on retourne un erreur 401 "Unauthorized"
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        // Etape 3 : decoder le token pour savoir de quel user il s'agit
        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        );
        if (
            !decodedToken ||
            typeof decodedToken !== "object" ||
            !("id" in decodedToken)
        ) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // on recupere l'id du user a partir du token decode
        (req as any).userId = (decodedToken as { id: string }).id;
        next();
    } catch (error) {
        // Token invalide ou expire
        return res.status(401).json({ message: "Unauthorized" });
    }
};
