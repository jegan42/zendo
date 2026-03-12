// =============================================================
// PHASE 1 : SCAN - Lire les images de reference et grouper par produit
// =============================================================

import fs from "fs";
import path from "path";
import { ReferenceImage, ScannedProduct } from "./types";
import {
  parseFilename,
  formatProductName,
  extractMaterials,
  generateReference,
  generateDescription,
  resetReferenceCounter,
} from "./utils";

// --- Scanner le dossier d'images de reference ---
// Retourne la liste des images trouvees
const scanImages = (srcDir: string): ReferenceImage[] => {
  const images: ReferenceImage[] = [];

  // Lire les dossiers famille (Femme, Homme, Jouet...)
  const families = fs.readdirSync(srcDir).filter((f) => {
    const fullPath = path.join(srcDir, f);
    return fs.statSync(fullPath).isDirectory() && !f.startsWith(".");
  });

  for (const family of families) {
    const familyPath = path.join(srcDir, family);
    const entries = fs.readdirSync(familyPath);

    for (const entry of entries) {
      const entryPath = path.join(familyPath, entry);

      if (fs.statSync(entryPath).isDirectory()) {
        // Sous-dossier categorie (ex: Femme/Vetements/)
        const category = entry;
        const files = fs.readdirSync(entryPath).filter((f) => f.endsWith(".png") || f.endsWith(".jpg"));

        for (const file of files) {
          const filename = path.parse(file).name;
          const parsed = parseFilename(filename);

          images.push({
            filePath: path.join(entryPath, file),
            filename: filename,
            family: family,
            category: category,
            color: parsed.color,
            productKey: `${family}/${category}/${parsed.productSlug}`,
          });
        }
      } else if (entry.endsWith(".png") || entry.endsWith(".jpg")) {
        // Fichier directement dans le dossier famille (ex: Jouet/doudou-lapin.png)
        const filename = path.parse(entry).name;
        const parsed = parseFilename(filename);

        images.push({
          filePath: entryPath,
          filename: filename,
          family: family,
          category: "Jouet", // Les items sans sous-dossier categorie sont des jouets
          color: parsed.color,
          productKey: `${family}/Jouet/${parsed.productSlug}`,
        });
      }
    }
  }

  return images;
};

// --- Grouper les images par productKey pour creer les produits ---
export const scanAndGroup = (srcDir: string): ScannedProduct[] => {
  resetReferenceCounter();

  const images = scanImages(srcDir);
  console.log(`[scan] ${images.length} images de reference trouvees`);

  // Grouper par productKey
  const groups = new Map<string, ReferenceImage[]>();
  for (const img of images) {
    const existing = groups.get(img.productKey) || [];
    existing.push(img);
    groups.set(img.productKey, existing);
  }

  console.log(`[scan] ${groups.size} produits uniques detectes`);

  // Creer les ScannedProduct
  const products: ScannedProduct[] = [];

  for (const [productKey, imgs] of groups) {
    const first = imgs[0];

    // Extraire le slug produit (sans couleur) depuis le productKey
    const slug = productKey.split("/").pop() || "";
    const name = formatProductName(slug);
    const materials = extractMaterials(slug);
    const reference = generateReference(first.family, first.category);
    const description = generateDescription(name, materials);

    const colorVariants = imgs.map((img) => ({
      color: img.color,
      referenceImagePath: img.filePath,
      generatedImages: {},
      cloudinaryUrls: [],
    }));

    products.push({
      productKey,
      name,
      family: first.family,
      category: first.category,
      description,
      material: materials,
      reference,
      madeInFrance: true,
      colorVariants,
    });
  }

  // Trier par famille puis categorie pour un affichage propre
  products.sort((a, b) => {
    const famCmp = a.family.localeCompare(b.family);
    if (famCmp !== 0) return famCmp;
    return a.category.localeCompare(b.category);
  });

  return products;
};
