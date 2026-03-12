// =============================================================
// PHASE 2 : GENERATE - Appeler Gemini pour generer les variations
// =============================================================

import path from "path";
import fs from "fs";
import { PipelineState } from "./types";
import { ANGLES } from "./constants";
import { generateAllAngles } from "../../services/gemini-image";
import { getColorDisplay } from "./utils";

// Dossier de sortie pour les images generees (hors du repo git)
const GENERATED_DIR = "/Users/yukimurra/Downloads/Img Generated ZENDO";

// --- Generer les variations pour tous les produits ---
export const runGenerate = async (state: PipelineState): Promise<void> => {
  const products = state.scannedProducts;
  const startProduct = state.lastGeneratedIndex.productIdx;
  const startVariant = state.lastGeneratedIndex.variantIdx;
  const startAngle = state.lastGeneratedIndex.angleIdx;

  // Compter le total pour le suivi
  let totalImages = 0;
  let totalVariants = 0;
  for (const p of products) {
    totalVariants += p.colorVariants.length;
  }

  console.log(`[generate] ${products.length} produits, ${totalVariants} variantes couleur`);
  console.log(`[generate] ${totalVariants * ANGLES.length} images a generer (4 angles chacune)`);

  if (startProduct > 0 || startVariant > 0) {
    console.log(`[generate] Reprise depuis produit ${startProduct}, variante ${startVariant}`);
  }

  for (let pIdx = startProduct; pIdx < products.length; pIdx++) {
    const product = products[pIdx];
    const productDir = path.join(GENERATED_DIR, product.productKey.replace(/\//g, "-"));

    console.log(`\n[${pIdx + 1}/${products.length}] ${product.name} (${product.family}/${product.category})`);

    const variantStart = pIdx === startProduct ? startVariant : 0;

    for (let vIdx = variantStart; vIdx < product.colorVariants.length; vIdx++) {
      const variant = product.colorVariants[vIdx];
      const colorName = getColorDisplay(variant.color);

      console.log(`  Variante: ${colorName}`);

      // Verifier si les images existent deja (resume)
      const existingAngles: Record<string, string> = {};
      let allExist = true;
      for (const angle of ANGLES) {
        const prefix = variant.color ? `${variant.color}-` : "";
        const expectedPath = path.join(productDir, `${prefix}${angle.id}.png`);
        if (fs.existsSync(expectedPath)) {
          existingAngles[angle.id] = expectedPath;
        } else {
          allExist = false;
        }
      }

      if (allExist) {
        console.log(`  -> Deja genere, skip`);
        variant.generatedImages = existingAngles as any;
        continue;
      }

      // Generer les angles manquants
      const results = await generateAllAngles(
        variant.referenceImagePath,
        product.name,
        productDir,
        variant.color,
        ANGLES,
        (angleId, status) => {
          console.log(`    ${angleId}: ${status}`);
        }
      );

      // Mettre a jour l'etat
      variant.generatedImages = { ...existingAngles, ...results } as any;
      totalImages += Object.keys(results).length;

      // Sauvegarder l'etat apres chaque variante (pour resume)
      state.lastGeneratedIndex = { productIdx: pIdx, variantIdx: vIdx + 1, angleIdx: 0 };
    }
  }

  console.log(`\n[generate] Termine : ${totalImages} images generees`);
  state.phase = "upload";
};
