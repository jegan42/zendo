// =============================================================
// SEED PIPELINE - Orchestrateur principal
// Genere des variations d'images, upload sur Cloudinary,
// et insere les produits en MongoDB
//
// Usage :
//   npx ts-node src/scripts/seed-pipeline.ts              -- pipeline complet
//   npx ts-node src/scripts/seed-pipeline.ts --test       -- test sur 3 images
//   npx ts-node src/scripts/seed-pipeline.ts --resume     -- reprendre apres interruption
//   npx ts-node src/scripts/seed-pipeline.ts --scan-only  -- scan uniquement (dry run)
//   npx ts-node src/scripts/seed-pipeline.ts --pause-after-generate -- pause apres generation pour review
// =============================================================

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { PipelineState } from "./pipeline/types";
import { scanAndGroup } from "./pipeline/scan";
import { runGenerate } from "./pipeline/generate";
import { runUpload } from "./pipeline/upload";
import { runSeed } from "./pipeline/seed";

dotenv.config();

// --- Config ---
const IMAGES_SRC = "/Users/yukimurra/Downloads/Img Src ZENDO";
const STATE_FILE = path.resolve(__dirname, "../../pipeline-state.json");

// 3 images de test (diversite famille/categorie)
const TEST_IMAGES = [
  "Femme/Bijoux/collier-artisanal-argent.png",
  "Homme/Vetements/chemise-lin-blanc.png",
  "Maison/Decoration/vase-ceramique-blanc-mat.png",
];

// --- Gestion du state ---
const loadState = (): PipelineState | null => {
  if (fs.existsSync(STATE_FILE)) {
    const data = fs.readFileSync(STATE_FILE, "utf-8");
    return JSON.parse(data);
  }
  return null;
};

const saveState = (state: PipelineState) => {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
};

const createInitialState = (): PipelineState => ({
  phase: "scan",
  scannedProducts: [],
  lastGeneratedIndex: { productIdx: 0, variantIdx: 0, angleIdx: 0 },
  lastUploadedIndex: { productIdx: 0, variantIdx: 0, imageIdx: 0 },
  createdProductIds: [],
  createdVariationIds: [],
});

// --- Filtrer les produits pour le mode test ---
const filterTestProducts = (state: PipelineState): void => {
  // Garder uniquement les produits qui contiennent les images de test
  const testPaths = TEST_IMAGES.map((img) => path.join(IMAGES_SRC, img));

  state.scannedProducts = state.scannedProducts.filter((product) => {
    return product.colorVariants.some((variant) => {
      return testPaths.some((tp) => variant.referenceImagePath === tp);
    });
  });

  console.log(`[test] Filtre a ${state.scannedProducts.length} produits de test`);
};

// --- Pipeline principal ---
const main = async () => {
  const args = process.argv.slice(2);
  const isTest = args.includes("--test");
  const isResume = args.includes("--resume");
  const isScanOnly = args.includes("--scan-only");
  const isPauseAfterGenerate = args.includes("--pause-after-generate");

  console.log("=== ZENDO SEED PIPELINE ===");
  console.log(`Mode: ${isTest ? "TEST (3 images)" : "COMPLET"}`);
  console.log(`Source: ${IMAGES_SRC}`);
  console.log("");

  // Charger ou creer l'etat
  let state: PipelineState;

  if (isResume) {
    const loaded = loadState();
    if (!loaded) {
      console.error("Pas de state a reprendre. Lancez sans --resume.");
      process.exit(1);
    }
    state = loaded;
    console.log(`[resume] Reprise depuis la phase: ${state.phase}`);
  } else {
    state = createInitialState();
  }

  const startTime = Date.now();

  try {
    // Phase 1 : Scan
    if (state.phase === "scan") {
      console.log("\n--- PHASE 1 : SCAN ---");
      state.scannedProducts = scanAndGroup(IMAGES_SRC);

      if (isTest) {
        filterTestProducts(state);
      }

      // Afficher un resume
      for (const p of state.scannedProducts) {
        const colors = p.colorVariants.map((v) => v.color || "default").join(", ");
        console.log(`  ${p.reference} | ${p.name} | ${p.family}/${p.category} | couleurs: ${colors}`);
      }

      state.phase = "generate";
      saveState(state);

      if (isScanOnly) {
        console.log("\n[scan-only] Arret apres le scan (dry run)");
        return;
      }
    }

    // Phase 2 : Generate
    if (state.phase === "generate") {
      console.log("\n--- PHASE 2 : GENERATION GEMINI ---");
      await runGenerate(state);
      saveState(state);

      if (isPauseAfterGenerate) {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log("\n=== PAUSE APRES GENERATION ===");
        console.log(`Duree generation: ${elapsed}s`);
        console.log("Images generees dans: /Users/yukimurra/Downloads/Img Generated ZENDO/");
        console.log("Passez en revue les images, puis relancez avec --resume pour continuer.");
        return;
      }
    }

    // Phase 3 : Upload
    if (state.phase === "upload") {
      console.log("\n--- PHASE 3 : UPLOAD CLOUDINARY ---");
      await runUpload(state);
      saveState(state);
    }

    // Phase 4 : Seed
    if (state.phase === "seed") {
      console.log("\n--- PHASE 4 : INSERTION MONGODB ---");
      await runSeed(state);
      saveState(state);
    }

    // Termine
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log("\n=== PIPELINE TERMINE ===");
    console.log(`Duree totale: ${elapsed}s`);
    console.log(`Produits crees: ${state.createdProductIds.length}`);
    console.log(`State sauvegarde dans: ${STATE_FILE}`);
  } catch (error) {
    console.error("\n[ERREUR PIPELINE]", error);
    saveState(state);
    console.log(`State sauvegarde. Relancez avec --resume pour reprendre.`);
    process.exit(1);
  }
};

main();
