// =============================================================
// PHASE 3 : UPLOAD - Envoyer les images sur Cloudinary
// =============================================================

import { PipelineState } from "./types";
import { configureCloudinary, uploadImage } from "../../services/cloudinary";
import { getColorDisplay } from "./utils";

// --- Upload toutes les images sur Cloudinary ---
export const runUpload = async (state: PipelineState): Promise<void> => {
  configureCloudinary();

  const products = state.scannedProducts;
  const startProduct = state.lastUploadedIndex.productIdx;
  const startVariant = state.lastUploadedIndex.variantIdx;

  let totalUploaded = 0;

  console.log(`[upload] Upload des images vers Cloudinary...`);

  if (startProduct > 0 || startVariant > 0) {
    console.log(`[upload] Reprise depuis produit ${startProduct}, variante ${startVariant}`);
  }

  for (let pIdx = startProduct; pIdx < products.length; pIdx++) {
    const product = products[pIdx];
    const folder = `${product.family}/${product.category}/${product.productKey.split("/").pop()}`;

    console.log(`\n[${pIdx + 1}/${products.length}] ${product.name}`);

    const variantStart = pIdx === startProduct ? startVariant : 0;

    for (let vIdx = variantStart; vIdx < product.colorVariants.length; vIdx++) {
      const variant = product.colorVariants[vIdx];
      const colorName = getColorDisplay(variant.color);
      const prefix = variant.color || "default";

      // Skip si deja upload (resume)
      if (variant.cloudinaryUrls.length > 0) {
        console.log(`  ${colorName}: deja uploade, skip`);
        continue;
      }

      console.log(`  ${colorName}:`);
      const urls: string[] = [];

      // 1. Upload l'image de reference
      try {
        console.log(`    reference...`);
        const refUrl = await uploadImage(variant.referenceImagePath, folder, `${prefix}-reference`);
        urls.push(refUrl);
        totalUploaded++;
      } catch (error) {
        const msg = error instanceof Error ? error.message : JSON.stringify(error);
        console.error(`    [erreur reference] ${msg}`);
      }

      // 2. Upload les images generees (display, lifestyle, zoom, flat)
      const generated = variant.generatedImages;
      const angleIds = ["display", "lifestyle", "zoom", "flat"] as const;

      for (const angleId of angleIds) {
        const filePath = generated[angleId];
        if (!filePath) continue;

        try {
          console.log(`    ${angleId}...`);
          const url = await uploadImage(filePath, folder, `${prefix}-${angleId}`);
          urls.push(url);
          totalUploaded++;
        } catch (error) {
          const msg = error instanceof Error ? error.message : JSON.stringify(error);
          console.error(`    [erreur ${angleId}] ${msg}`);
        }
      }

      variant.cloudinaryUrls = urls;

      // Sauvegarder l'etat apres chaque variante
      state.lastUploadedIndex = { productIdx: pIdx, variantIdx: vIdx + 1, imageIdx: 0 };
    }
  }

  console.log(`\n[upload] Termine : ${totalUploaded} images uploadees`);
  state.phase = "seed";
};
