import mongoose from "mongoose";

const ALLOWED_CHANNELS = new Set(["whatsapp", "email", "sms", "organic"]);

const channelServiceSimulation = async (req, res) => {
    try {
        const { userId, channel, content, campaignId } = req.body;

        if (
            !mongoose.isValidObjectId(userId) ||
            !mongoose.isValidObjectId(campaignId) ||
            !ALLOWED_CHANNELS.has(channel) ||
            typeof content !== "string" ||
            !content.trim()
        ) {
            return res.status(400).json({
                message: "Invalid channel request",
                success: false
            });
        }

        const port = process.env.PORT || 8000;

        const postEvent = async (status) => {
            const response = await fetch(`http://localhost:${port}/receipt`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId,
                    campaignId,
                    channel,
                    status,
                    date: new Date()
                })
            });

            if (!response.ok) {
                throw new Error(`Receipt service failed with status ${response.status}`);
            }
        };

        await postEvent("sent");

        res.json({ success: true });

        const sendEvent = (status, delay) => {
            setTimeout(async () => {
                try {
                    await postEvent(status);
                } catch (err) {
                    console.error(err);
                }
            }, delay);
        };

        if (Math.random() < 0.2) {
            sendEvent("failed", 1000);
        } else {
            sendEvent("delivered", 1000);
            const willOpen = Math.random() < 0.7;

            if (willOpen) {
                sendEvent("opened", 2000);

                if (Math.random() < 0.5) {
                    sendEvent("clicked", 3000);
                }
            }
        }

    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            return res.status(500).json({
                message: "Channel service failed",
                success: false
            });
        }
    }
};

export default channelServiceSimulation;
