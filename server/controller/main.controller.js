import mongoose from "mongoose";
import Customer from "../models/customers.model.js";
import Campaign from "../models/campaign.model.js";
import Event from "../models/event.model.js";
import Insights from "../models/insights.model.js";
import { buildMongoDBQuery } from "../utils/buildMongoDBQuery.js";
import { extractInfoFromPrompt } from "../utils/extractInfoFromPrompt.js";
import { generateInsight } from "../utils/generateInsights.js";

const parseCampaignPlan = (extractedInfo) => {
    const cleanedInfo = extractedInfo
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "");

    const campaignPlan = JSON.parse(cleanedInfo);
    const filters = campaignPlan?.target_segment?.filters;
    const message = campaignPlan?.message;

    if (
        !campaignPlan?.goal ||
        !campaignPlan?.strategy ||
        !Array.isArray(filters) ||
        !message?.channel ||
        !message?.content
    ) {
        throw new Error("The generated campaign plan is incomplete");
    }

    return campaignPlan;
};

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
        const parsedExtractedInfo = parseCampaignPlan(extractedInfo);

        const filterArray = parsedExtractedInfo.target_segment.filters;
        const message = parsedExtractedInfo.message;

        const query = buildMongoDBQuery(filterArray);


        const users = await Customer.find(query).limit(1000);

        if(users.length == 0)
        {
            return res.status(404).json({
                message: "No users found in database",
                query: query,
                success: false
            })
        }

        const campaign = await Campaign.create({
            goal: parsedExtractedInfo.goal,
            strategy: parsedExtractedInfo.strategy,
            message: message.content,
        });

        // call channel service
        const BATCH_SIZE = 50;
        const port = process.env.PORT || 8000;

        for (let i = 0; i < users.length; i += BATCH_SIZE) {
            const batch = users.slice(i, i + BATCH_SIZE);

            await Promise.all(
                batch.map(async (user) => {
                    const response = await fetch(`http://localhost:${port}/send`, {
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

                    if (!response.ok) {
                        throw new Error(`Channel service failed with status ${response.status}`);
                    }
                })
            );
        }

        return res.status(200).json({
            message: "Campaign started",
            audienceSize: users.length,
            success: true,
            campaignId: campaign._id,
            campaignMessage: message.content,
            channel: message.channel,
            goal: parsedExtractedInfo.goal,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }    
}

const getStats = async (req, res) => {
    try {
        const { campaignId } = req.params;

        if (!mongoose.isValidObjectId(campaignId)) {
            return res.status(400).json({
                message: "Invalid campaign ID",
                success: false
            });
        }

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

        const insights = generateInsight(stats);

        const saveInsignts = await Insights.create({
            campaignId,
            summary: insights.summary,
            inssues: insights.issues,
            positives: insights.positives,
            actions: insights.actions,
            stats
        })

        if(!saveInsignts)
        {
            return res.status(500).json({
                message: "Database Server Error",
                success: false
            })
        }

        return res.status(200).json({
            campaignId,
            stats,
            insights,
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
