import { GoogleGenerativeAI } from "@google/generative-ai";

export const extractInfoFromPrompt = async (userPrompt) => {
   const genAI = new GoogleGenerativeAI(process.env.API_KEY);

   const model = genAI.getGenerativeModel({model: "gemini-3-flash-preview"});

   const prompt = `You are a CRM AI.

   Given a goal, identify the core marketing strategy components.

   These can include things like:
   - targeting inactive users
   - discounts or offers
   - urgency or scarcity
   - personalization
   - product recommendations

   Generate a campaign plan in JSON.

   INPUT:
   User prompt: ${userPrompt}

   OUTPUT:
   Return ONLY valid JSON. No explanation.

   IMPORTANT:
   You MUST use ONLY these fields for segmentation:

   orderCount (number)
   totalSpent (number)
   daysSinceLastOrder (number)
   emailSubscribed (boolean)

   You MUST generate filters in this EXACT format:
   [
      {
         "field": "orderCount",
         "operator": "==",
         "value": 1
      }
   ]

   Allowed operators:
   ==, !=, >, <, >=, <=

   Format:
   {
      "goal": "",
      "target_segment": {
         "description": "",
         "filters": []
      },
      "strategy": "",
      "strategy_components": [],
      "message": {
         "channel": "",
         "content": ""
      },
   }

   Rules:

   * Output must be strictly valid JSON
   * Do NOT invent new fields
   * Use camelCase field names exactly as provided
   * No extra text outside JSON
   * Be specific and actionable
   * Keep steps clear and executable
   * Channel must be one of: ["whatsapp", "email", "sms", "organic"]
   * If unsure, default channel = "organic"
   * You must choose a channel based on the goal and explain reasoning internally.Prefer "organic" if no strong reason exists.
   `

   const response = await model.generateContent(prompt);

   const planJson = response.response.text();

   return planJson;
}
