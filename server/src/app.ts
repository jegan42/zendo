import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import indexRoutes from "./routes/index";

dotenv.config();

const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:3000",
            // "https://ton-front.vercel.app",
        ],
        credentials: true,
    })
);

app.use(express.json());

app.use("/api", indexRoutes);

app.get("/", function (_req, res) {
    res.json({ message: "API Zendo fonctionne" });
});

export default app;
