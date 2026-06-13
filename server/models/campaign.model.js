import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
    {
        goal: {
            type: String,
            required: true,
            trim: true
        },
        strategy: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;
