import mongoose from "mongoose";

const SellerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            unique: true,
            required: true,
        },

        shopName: { type: String, required: true },

        //  logo de la boutique
        shopLogo: { 
            type: String, 
            default: "" ,
        },

        shopStatus: { type: Boolean, default: true },

        siretNumber: { type: String },

        stripeConnectId: { type: String },

        payoutsEnabled: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model("Seller", SellerSchema);
