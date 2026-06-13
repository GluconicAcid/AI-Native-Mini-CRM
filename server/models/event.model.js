import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },
        campaignId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign",
            required: true
        },
        channel: {
            type: String,
            enum: ["whatsapp", "email", "sms", "organic"],
            required: true
        },
        status: {
            type: String,
            enum: ["sent", "delivered", "opened", "clicked", "failed"],
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
