// =============================================================
// TYPES PIPELINE - Types partages pour le pipeline de seeding
// =============================================================

// Une image de reference sur le disque
export type ReferenceImage = {
  filePath: string;
  filename: string;
  family: string;
  category: string;
  color: string;
  productKey: string;
};

// Une variante couleur d'un produit
export type ColorVariant = {
  color: string;
  referenceImagePath: string;
  generatedImages: {
    display?: string;
    lifestyle?: string;
    zoom?: string;
    flat?: string;
  };
  cloudinaryUrls: string[];
};

// Un produit deduit du scan (peut avoir plusieurs variantes couleur)
export type ScannedProduct = {
  productKey: string;
  name: string;
  family: string;
  category: string;
  description: string;
  material: string[];
  reference: string;
  madeInFrance: boolean;
  colorVariants: ColorVariant[];
};

// Etat du pipeline persiste sur disque (pour resume)
export type PipelineState = {
  phase: "scan" | "generate" | "upload" | "seed" | "done";
  scannedProducts: ScannedProduct[];
  lastGeneratedIndex: { productIdx: number; variantIdx: number; angleIdx: number };
  lastUploadedIndex: { productIdx: number; variantIdx: number; imageIdx: number };
  createdProductIds: string[];
  createdVariationIds: string[];
};

// Configuration d'un angle de generation
export type AngleConfig = {
  id: string;
  name: string;
  prompt: string;
};
