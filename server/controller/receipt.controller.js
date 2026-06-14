import mongoose from "mongoose";
import Event from "../models/event.model.js";

const ALLOWED_CHANNELS = new Set(["whatsapp", "email", "sms", "organic"]);
const ALLOWED_STATUSES = new Set(["sent", "delivered", "opened", "clicked", "failed"]);

const receipt = async (req, res) => {
    try {
        const { userId, campaignId, channel, status, date } = req.body;

        if (
            !mongoose.isValidObjectId(userId) ||
            !mongoose.isValidObjectId(campaignId) ||
            !ALLOWED_CHANNELS.has(channel) ||
            !ALLOWED_STATUSES.has(status) ||
            (date && Number.isNaN(Date.parse(date)))
        ) {
            return res.status(400).json({
                message: "Invalid event receipt",
                success: false
            });
        }

        console.log("Event received:", userId, status);

        await Event.create({
            userId,
            campaignId,
            channel,
            status,
            date
        });

        return res.json({ success: true });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false });
    }
};

export default receipt;
