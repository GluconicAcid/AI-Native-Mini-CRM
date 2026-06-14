import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        _id: false
    }
);

const orderSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
            index: true
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "An order must contain at least one item"
            }
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: ["completed"],
            default: "completed"
        },
        orderedAt: {
            type: Date,
            required: true,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
