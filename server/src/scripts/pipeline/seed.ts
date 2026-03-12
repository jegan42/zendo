// =============================================================
// PHASE 4 : SEED - Inserer les produits et variations en MongoDB
// v2 : images reparties par variation (pas tout sur Product)
// =============================================================

import mongoose from "mongoose";
import Product from "../../models/Product";
import Variation from "../../models/Variation";
import { PipelineState } from "./types";
import { PRICE_RANGES, SIZES_BY_CATEGORY } from "./constants";
import { getColorDisplay, randomPrice, randomStock } from "./utils";

// Seller ID fixe (compte yukimurra)
const SELLER_ID = "69b1a96fde255a09270fe831";

// --- Inserer les produits et variations en MongoDB ---
export const runSeed = async (state: PipelineState): Promise<void> => {
  const products = state.scannedProducts;

  console.log(`[seed] Connexion a MongoDB...`);
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log(`[seed] Connecte`);

  let productsCreated = 0;
  let variationsCreated = 0;

  try {
    for (let pIdx = 0; pIdx < products.length; pIdx++) {
      const product = products[pIdx];

      // Verifier si le produit existe deja (par reference)
      const existing = await Product.findOne({ reference: product.reference });
      if (existing) {
        console.log(`  [skip] ${product.name} (ref ${product.reference}) existe deja`);
        state.createdProductIds.push(String(existing._id));
        continue;
      }

      // Product.images = 1ere image de la 1ere variante (thumbnail pour listing/home)
      const firstVariantUrls = product.colorVariants[0]?.cloudinaryUrls || [];
      const productImages = firstVariantUrls.length > 0 ? [firstVariantUrls[0]] : [];

      // Creer le produit
      console.log(`  [${pIdx + 1}/${products.length}] ${product.name} (${product.reference})`);

      const created = await Product.create({
        name: product.name,
        description: product.description,
        images: productImages,
        family: product.family,
        category: product.category,
        material: product.material,
        madeInFrance: product.madeInFrance,
        reference: product.reference,
        status: true,
        sellerId: new mongoose.Types.ObjectId(SELLER_ID),
      });

      state.createdProductIds.push(String(created._id));
      productsCreated++;

      // Creer les variations (couleur x taille)
      const priceRange = PRICE_RANGES[product.category] || PRICE_RANGES["Jouet"] || [20, 50];
      const sizes = SIZES_BY_CATEGORY[product.category] || ["Unique"];

      // Un prix de base par produit (les tailles ont le meme prix)
      const basePrice = randomPrice(priceRange[0], priceRange[1]);

      for (const variant of product.colorVariants) {
        const colorName = getColorDisplay(variant.color);

        // Variation.images = toutes les URLs Cloudinary de CETTE couleur
        // (reference + display + lifestyle + zoom + flat)
        const variationImages = variant.cloudinaryUrls;

        for (const size of sizes) {
          await Variation.create({
            productId: created._id,
            color: colorName,
            size: size,
            price: basePrice,
            stock: randomStock(),
            images: variationImages,
          });
          variationsCreated++;
        }
      }

      const totalVarImages = product.colorVariants.reduce((sum, v) => sum + v.cloudinaryUrls.length, 0);
      console.log(
        `    -> ${productImages.length} img produit, ${totalVarImages} img variations, ${product.colorVariants.length * sizes.length} variations`
      );
    }
  } finally {
    await mongoose.disconnect();
    console.log(`[seed] Deconnecte de MongoDB`);
  }

  state.createdVariationIds = [];
  state.phase = "done";

  console.log(`\n[seed] Termine : ${productsCreated} produits, ${variationsCreated} variations crees`);
};
