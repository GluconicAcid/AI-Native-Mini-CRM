import Customer from "../models/customers.model.js";
import Campaign from "../models/campaign.model.js";
import Event from "../models/event.model.js";
import { buildMongoDBQuery } from "../utils/buildMongoDBQuery.js";
import { extractInfoFromPrompt } from "../utils/extractInfoFromPrompt.js";

const handleTheRequest = async (req, res) => {
    try {
        const { prompt } = req.body;

        if(!prompt)
        {
            return res.status(400).json({
                message: "Prompt is required",
                success: false
            })
        }

        const extractedInfo = await extractInfoFromPrompt(prompt);

        const parsedExtractedInfo = JSON.parse(extractedInfo);

        const campaign = await Campaign.create({
            goal: parsedExtractedInfo.goal,
            strategy: parsedExtractedInfo.strategy,
            message: parsedExtractedInfo.message.content,
        });

        const filterArray = parsedExtractedInfo.target_segment.filters;
        const message = parsedExtractedInfo.message;

        const query = buildMongoDBQuery(filterArray);

        const users = await Customer.find(query).limit(1000);

        if(users.length == 0)
        {
            return res.status(404).json({
                message: "No users found",
                success: false
            })
        }

        res.status(200).json({
            message: "Campaign started",
            audienceSize: users.length,
            success: true
        });

        // call channel service
        const BATCH_SIZE = 50;

        for (let i = 0; i < users.length; i += BATCH_SIZE) {
            const batch = users.slice(i, i + BATCH_SIZE);

            await Promise.all(
                batch.map(user => {
                    return fetch("http://localhost:8000/send", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            userId: user._id,
                            channel: message.channel,
                            content: message.content.replace("{{name}}", user.name || "there"),
                            campaignId: campaign._id
                        })
                    });
                })
            );
        }

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }    
}

const getStats = async (req, res) => {
    try {
        const { campaignId } = req.params;

        const totalSent = await Event.countDocuments({
            campaignId,
            status: "sent"
        });

        const delivered = await Event.countDocuments({
            campaignId,
            status: "delivered"
        });

        const opened = await Event.countDocuments({
            campaignId,
            status: "opened"
        });

        const clicked = await Event.countDocuments({
            campaignId,
            status: "clicked"
        });

        const failed = await Event.countDocuments({
            campaignId,
            status: "failed"
        });

        const stats = {
            deliveryRate: totalSent ? delivered / totalSent : 0,
            openRate: delivered ? opened / delivered : 0,
            ctr: opened ? clicked / opened : 0,
            failureRate: totalSent ? failed / totalSent : 0
        };

        return res.status(200).json({
            campaignId,
            stats,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

export {handleTheRequest, getStats};
