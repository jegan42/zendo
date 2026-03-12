// =============================================================
// SERVICE GEMINI IMAGE - Generation d'images via Gemini API
// Adapte du mini app image-variations-generator
// Lit depuis le disque, sauvegarde sur le disque
// =============================================================

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { BATCH_DELAY_MS, RATE_LIMIT_WAIT_MS, MAX_RETRIES } from "../scripts/pipeline/constants";
import { AngleConfig } from "../scripts/pipeline/types";
import { delay } from "../scripts/pipeline/utils";

// Modele Gemini pour la generation d'images (Nano Banana 2)
const IMAGE_MODEL = "gemini-3.1-flash-image-preview";

// --- Detecter une erreur de rate limit ---
const isRateLimitError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes("429") || msg.includes("rate limit") || msg.includes("resource exhausted");
  }
  return false;
};

// --- Appel avec retry automatique sur 429 ---
const callWithRetry = async (fn: () => Promise<string>): Promise<string> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (isRateLimitError(error) && attempt < MAX_RETRIES) {
        console.log(
          `  [rate limit] Tentative ${attempt}/${MAX_RETRIES}, attente ${RATE_LIMIT_WAIT_MS / 1000}s...`
        );
        await delay(RATE_LIMIT_WAIT_MS);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
};

// --- Generer une image similaire a partir d'une image de reference ---
// Retourne le chemin du fichier genere
export const generateImageFromReference = async (
  imagePath: string,
  promptContext: string,
  outputPath: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Lire l'image depuis le disque
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";

  const dataUri = await callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image,
          },
        },
        {
          text: `You are an expert product photographer. Analyze the provided reference image of a product. Generate a new highly realistic photograph of THIS EXACT SAME PRODUCT, but strictly following this specific angle, framing, and style: "${promptContext}".

CRITICAL INSTRUCTIONS:
- Maintain the exact same colors, materials, patterns, and core design of the original product.
- The output must look like a real, professional photograph.
- Do not add text or watermarks.`,
        },
      ],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    // Extraire l'image generee de la reponse
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Aucune image dans la reponse Gemini");
  });

  // Sauvegarder sur le disque
  const base64Data = dataUri.split(",")[1];
  const buffer = Buffer.from(base64Data, "base64");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);

  return outputPath;
};

// --- Generer toutes les variations d'angle pour une image ---
// Retourne un objet { angleId: cheminFichier }
export const generateAllAngles = async (
  imagePath: string,
  productName: string,
  outputDir: string,
  colorSlug: string,
  angles: AngleConfig[],
  onProgress?: (angleId: string, status: string) => void
): Promise<Record<string, string>> => {
  const results: Record<string, string> = {};
  let isFirstCall = true;

  for (const angle of angles) {
    // Delai entre chaque appel (sauf le premier)
    if (!isFirstCall) {
      await delay(BATCH_DELAY_MS);
    }
    isFirstCall = false;

    const prefix = colorSlug ? `${colorSlug}-` : "";
    const outputPath = path.join(outputDir, `${prefix}${angle.id}.png`);

    if (onProgress) {
      onProgress(angle.id, "en cours");
    }

    try {
      const promptContext = `Article: "${productName}". ${angle.prompt}`;
      await generateImageFromReference(imagePath, promptContext, outputPath);
      results[angle.id] = outputPath;

      if (onProgress) {
        onProgress(angle.id, "ok");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`  [erreur] ${angle.name}: ${msg}`);

      if (onProgress) {
        onProgress(angle.id, "echec");
      }
    }
  }

  return results;
};
