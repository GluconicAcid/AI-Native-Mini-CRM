import Insights from "../models/insights.model.js"

export const getBestCampaignLearnings = async () => {
    try {
        const insights = await Insights.find();

        if(!insights || insights.length == 0)
        {
            return [];
        }

        const scored = insights.map(i => {
            const stats = i.stats || {}

            const score = (stats.ctr || 0 ) * 0.5 + (stats.openRate || 0) * 0.3 + (stats.deliveryRate || 0) * 0.2;

            return {
                score,
                positives: i.positives || [],
                issues: i.issues || []
            }
        })

        scored.sort((a, b) => b.score - a.score);

        const topInsigths = scored.slice(0, 3);

        return topInsigths.map(i => ({
            positives: i.positives,
            issues: i.issues
        }))
    
    } catch (error) {
        return [];   
    }
}