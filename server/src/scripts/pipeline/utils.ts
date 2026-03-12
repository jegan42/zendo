// =============================================================
// UTILITAIRES PIPELINE - Parser filenames, generer references
// =============================================================

import { COLOR_MAP, NON_COLOR_SUFFIXES, MATERIAL_MAP } from "./constants";

// --- Pause asynchrone ---
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// --- Extraire la couleur depuis un filename ---
// Retourne { productSlug, color } ou { productSlug, color: "" } si pas de couleur
export const parseFilename = (filename: string): { productSlug: string; color: string } => {
  const parts = filename.split("-");

  // Essayer avec les 2 derniers segments (couleurs composees : gris-chine, blanc-dore...)
  if (parts.length >= 3) {
    const compound = parts.slice(-2).join("-");
    if (COLOR_MAP[compound]) {
      return {
        productSlug: parts.slice(0, -2).join("-"),
        color: compound,
      };
    }
  }

  // Essayer avec le dernier segment (couleur simple : blanc, noir...)
  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    if (COLOR_MAP[last] && !NON_COLOR_SUFFIXES.includes(last)) {
      return {
        productSlug: parts.slice(0, -1).join("-"),
        color: last,
      };
    }
  }

  // Pas de couleur detectee
  return { productSlug: filename, color: "" };
};

// --- Formatter le nom produit depuis un slug ---
// blouse-brodee -> Blouse brodee
export const formatProductName = (slug: string): string => {
  const words = slug.split("-");
  const first = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return [first, ...words.slice(1)].join(" ");
};

// --- Extraire les materiaux depuis le slug ---
export const extractMaterials = (slug: string): string[] => {
  const parts = slug.split("-");
  const materials: string[] = [];

  for (const part of parts) {
    const mat = MATERIAL_MAP[part];
    if (mat && !materials.includes(mat)) {
      materials.push(mat);
    }
  }

  return materials;
};

// --- Generer une reference produit unique ---
// Format : ZEN-FEM-VET-001
let referenceCounter = 0;
export const generateReference = (family: string, category: string): string => {
  referenceCounter++;
  const fam = family.substring(0, 3).toUpperCase();
  const cat = category.substring(0, 3).toUpperCase();
  const num = String(referenceCounter).padStart(3, "0");
  return `ZEN-${fam}-${cat}-${num}`;
};

// --- Reset le compteur de references (utile pour les tests) ---
export const resetReferenceCounter = () => {
  referenceCounter = 0;
};

// --- Generer une description automatique ---
export const generateDescription = (name: string, materials: string[]): string => {
  const matStr = materials.length > 0 ? materials.join(", ") : "materiaux nobles";
  return `${name}, fabrique artisanalement en France. Matiere(s) : ${matStr}.`;
};

// --- Generer un prix aleatoire dans une fourchette ---
export const randomPrice = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

// --- Generer un stock aleatoire ---
export const randomStock = (): number => {
  return Math.floor(Math.random() * 16) + 5; // 5 a 20
};

// --- Obtenir le nom de couleur affiche ---
export const getColorDisplay = (colorSlug: string): string => {
  if (!colorSlug) return "Naturel";
  return COLOR_MAP[colorSlug] || colorSlug.charAt(0).toUpperCase() + colorSlug.slice(1);
};
