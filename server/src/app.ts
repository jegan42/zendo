import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import indexRoutes from "./routes/index";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://zendo-sandy.vercel.app",
  // plus tard :
  // "https://ton-front.vercel.app",
];

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

app.use("/api", indexRoutes);

app.get("/", function (_req, res) {
  res.json({ message: "API Zendo fonctionne" });
});

export default app;