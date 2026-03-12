import mongoose from "mongoose";

const VariationSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    color: { type: String },

    size: { type: String }, // size_clothe | size_shoes | ring_size

    stock: { type: Number, default: 0 },

    price: { type: Number, required: true },

    // URLs des images pour cette variation (optionnel)
    // Permet d'afficher plusieurs images par couleur dans la galerie produit
    images: [{ type: String }],
  },
  { timestamps: true },
);
export type Variation = mongoose.InferSchemaType<typeof VariationSchema>;
export default mongoose.model("Variation", VariationSchema);
