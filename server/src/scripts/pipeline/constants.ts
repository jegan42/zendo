// =============================================================
// CONSTANTES PIPELINE - Lookup tables et configs
// =============================================================

import { AngleConfig } from "./types";

// --- Prix par categorie (min, max en euros) ---
export const PRICE_RANGES: Record<string, [number, number]> = {
  Bijoux: [15, 45],
  Vetements: [25, 80],
  Chaussures: [40, 90],
  Sacs: [35, 75],
  Accessoires: [15, 40],
  Sport: [45, 85],
  Beaute: [8, 25],
  Luminaire: [30, 70],
  Tapis: [40, 120],
  Decoration: [20, 60],
  Art_de_la_table: [12, 35],
  Jouet: [15, 40],
};

// --- Tailles par categorie ---
export const SIZES_BY_CATEGORY: Record<string, string[]> = {
  Vetements: ["S", "M", "L"],
  Chaussures: ["38", "40", "42"],
  Sport: ["S", "M", "L"],
  Bijoux: ["Unique"],
  Sacs: ["Unique"],
  Accessoires: ["Unique"],
  Beaute: ["Unique"],
  Luminaire: ["Unique"],
  Tapis: ["120x170", "160x230"],
  Decoration: ["Unique"],
  Art_de_la_table: ["Unique"],
  Jouet: ["Unique"],
};

// --- Map materiaux : mots-cles dans le filename -> nom materiau ---
export const MATERIAL_MAP: Record<string, string> = {
  cuir: "Cuir",
  lin: "Lin",
  coton: "Coton",
  laine: "Laine",
  soie: "Soie",
  ceramique: "Ceramique",
  gres: "Gres",
  bois: "Bois",
  rotin: "Rotin",
  paille: "Paille",
  daim: "Daim",
  maille: "Laine",
  tricote: "Laine",
  tricotee: "Laine",
  brodee: "Coton",
  perles: "Perles",
  toile: "Toile",
  berbere: "Laine",
};

// --- Map couleurs connues (slug -> nom affiche) ---
export const COLOR_MAP: Record<string, string> = {
  blanc: "Blanc",
  noir: "Noir",
  bleu: "Bleu",
  "bleu-ciel": "Bleu ciel",
  "rose-poudre": "Rose poudre",
  beige: "Beige",
  ecru: "Ecru",
  terracotta: "Terracotta",
  "gris-chine": "Gris chine",
  camel: "Camel",
  cognac: "Cognac",
  taupe: "Taupe",
  olive: "Olive",
  navy: "Navy",
  charcoal: "Charcoal",
  marron: "Marron",
  silver: "Silver",
  naturel: "Naturel",
  or: "Or",
  argent: "Argent",
  dore: "Dore",
  "blanc-dore": "Blanc dore",
  "blanc-mat": "Blanc mat",
  vert: "Vert",
  floral: "Floral",
  multicolore: "Multicolore",
  lavande: "Lavande",
  miel: "Miel",
  rose: "Rose",
  gris: "Gris",
};

// --- Suffixes qui NE SONT PAS des couleurs (eviter les faux positifs) ---
export const NON_COLOR_SUFFIXES = [
  "bio",
  "artisanales",
  "artisanal",
  "parfumee",
  "animaux",
  "cheveux",
  "lapin",
  "train",
  "minimaliste",
  "oversize",
];

// --- 4 angles de generation Gemini ---
export const ANGLES: AngleConfig[] = [
  {
    id: "display",
    name: "Display produit",
    prompt:
      "Professional product display shot. The item is neatly folded, stacked, or laid flat. Focus purely on the product presentation without any human model. Studio lighting.",
  },
  {
    id: "lifestyle",
    name: "Vue en situation",
    prompt:
      "Lifestyle photography. The item is worn by a human model in a realistic, natural, or urban setting. Medium shot showing how the garment fits and falls.",
  },
  {
    id: "zoom",
    name: "Vue zoom",
    prompt:
      "Macro photography, extreme close-up shot. Focus tightly on the fabric texture, stitching, cuffs, collars, or specific material details. Very shallow depth of field.",
  },
  {
    id: "flat",
    name: "Vue a plat",
    prompt:
      "Perfect flat-lay photograph. The item is laid completely flat on a clean, minimal background. Shot from directly above (90 degrees).",
  },
];

// --- Delais API Gemini ---
export const BATCH_DELAY_MS = 4000;
export const RATE_LIMIT_WAIT_MS = 15000;
export const MAX_RETRIES = 3;
