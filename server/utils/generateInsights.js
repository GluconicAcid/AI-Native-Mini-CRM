export const generateInsight = (stats) => {
    const insights = {
        summary: "",
        issues: [],
        positives: [],
        actions: []
    }

    if(stats.deliveryRate < 0.7)
    {
        insights.issues.push("Critical delivery failure");
        insights.actions.push("Check email provider or clean invalid users");
    }
    else if(stats.deliveryRate < 0.8)
    {
        insights.issues.push("Poor delivery performance");
        insights.actions.push("Improve email list quality");
    }
    else if(stats.deliveryRate >= 0.9)
    {
        insights.positives.push("Excellent delivery rate");
    }

    if(stats.openRate < 0.15) 
    {
        insights.issues.push("Weak subject line");
        insights.actions.push("Use personalization or urgency in subject line");
    } 
    else if(stats.openRate > 0.35)
    {
        insights.positives.push("Excellent open rate");
    } 
    else if (stats.openRate > 0.25) 
    {
        insights.positives.push("Strong subject line");
    }

    if (stats.ctr < 0.1) 
    {
        insights.issues.push("Low engagement");
        insights.actions.push("Improve CTA and message clarity");
    } 
    else if(stats.ctr > 0.3) 
    {
        insights.positives.push("Highly engaging content");
    }

    if(stats.failureRate > 0.3)
    {
        insights.issues.push("Critical failure rate");
        insights.actions.push("Retry failed messages or change channel");
    } 
    else if(stats.failureRate > 0.2) 
    {
        insights.issues.push("High failure rate");
    }

    if (insights.issues.length === 0) 
    {
        insights.summary = "Campaign performed very well";
    } 
    else if(insights.positives.length > insights.issues.length) 
    {
        insights.summary = "Campaign performed well but has some issues";
    } else
    {
        insights.summary = "Campaign needs improvement";
    }

    return insights;
}