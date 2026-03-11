import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
    {
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },

        status: {
            type: String,
            enum: [
                "pending_payment",
                "paid",
                "shipped",
                "completed",
                "cancelled",
            ],
            default: "pending_payment",
        },

        totalAmount: { type: Number, required: true },
    },
    { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
