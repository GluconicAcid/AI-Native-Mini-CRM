import mongoose, { mongo, Schema } from "mongoose";

const insightsSchema = new Schema(
    {
        campaignId: {
            type: Schema.Types.ObjectId,
            ref: "Campaign",
            required: true
        },
        summary: {
            type: String,
            trim: true,
            required: true
        },
        issues: [{
            type: String,
            trim: true,
            required: true
        }],
        positives: [{
            type: String,
            trim: true,
            required: true
        }],
        actions: [{
            type: String,
            trim: true,
            required: true
        }],
        stats: {
            deliveryRate: {
                type: Number,
                required: true,
                min: 0,
                max: 1
            },
            openRate: {
                type: Number,
                required: true,
                min: 0,
                max: 1
            },
            ctr: {
                type: Number,
                required: true,
                min: 0,
                max: 1
            },
            failureRate: {
                type: Number,
                required: true,
                min: 0,
                max: 1
            }
        }
    },
    {
        timestamps: true
    }
)

const Insights = mongoose.model("Insights", insightsSchema);

export default Insights