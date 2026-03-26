import type { VercelRequest, VercelResponse } from "@vercel/node";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../src/app";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

declare global {
    // eslint-disable-next-line no-var
    var mongooseConnectionPromise: Promise<typeof mongoose> | undefined;
}

async function connectToDatabase() {
    if (!MONGO_URI) {
        throw new Error("MONGO_URI manquante");
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }

    if (!global.mongooseConnectionPromise) {
        global.mongooseConnectionPromise = mongoose.connect(MONGO_URI);
    }

    return global.mongooseConnectionPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        await connectToDatabase();
        return app(req, res);
    } catch (error) {
        console.error("Erreur backend Vercel:", error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}
