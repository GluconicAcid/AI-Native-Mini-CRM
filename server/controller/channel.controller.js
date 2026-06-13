import fetch from "node-fetch";

const channelServiceSimulation = async (req, res) => {
    try {
        const { userId, channel, content, campaignId } = req.body;

        if (!userId || !channel || !content) {
            return res.status(400).json({ success: false });
        }

        res.json({ success: true });

        const sendEvent = (status, delay) => {
            setTimeout(async () => {
                try {
                    await fetch("http://localhost:8000/receipt", {
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
                } catch (err) {
                    console.error(err);
                }
            }, delay);
        };

        if (Math.random() < 0.2) {
            sendEvent("failed", 1000);
        } else {
            sendEvent("delivered", 1000);
            if (Math.random() < 0.7) sendEvent("opened", 2000);
            if (Math.random() < 0.5) sendEvent("clicked", 3000);
        }

    } catch (error) {
        console.error(error);
    }
};

export default channelServiceSimulation;