import jwt from "jsonwebtoken";

// Recupere l'id du user a partir du token JWT dans les headers
// Retourne l'id du user ou null si le token est absent ou invalide
export function getUserFromHeaders(req: any): string | null {
  // Etape 1 : recupere le token d'authorization dans les headers
  const token = req.header("authorization")?.replace("Bearer ", "");

  // Etape 2 : si pas de token, on retourne null
  if (!token) {
    return null;
  }

  try {
    // Etape 3 : decoder le token pour savoir de quel user il s'agit
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
    // on recupere l'id du user a partir du token decode
    const userId = (decodedToken as { id: string }).id;
    return userId;
  } catch (error) {
    // Token invalide ou expire
    return null;
  }
}
