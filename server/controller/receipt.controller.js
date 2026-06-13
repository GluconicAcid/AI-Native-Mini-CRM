const receipt = async (req, res) => {
    try {
        const { userId, campaignId, channel, status, date } = req.body;

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