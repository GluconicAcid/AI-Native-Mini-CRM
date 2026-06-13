import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true
        },
        orderCount: {
            type: Number,
            default: 0,
            min: 0
        },
        totalSpent: {
            type: Number,
            default: 0,
            min: 0
        },
        daysSinceLastOrder: {
            type: Number,
            default: 0,
            min: 0
        },
        emailSubscribed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
