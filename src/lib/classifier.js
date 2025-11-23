import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
});

export async function analyzeUserMessage(message) {
    const prompt = `
    Analyze the following user message for a Bible companion app.
    Determine the user's:
    1. Emotion (e.g., sadness, anxiety, joy, anger, confusion, gratitude, overwhelmed, neutral, curious)
    2. Intent (e.g., encouragement, prayer, study, clarification, teaching, comfort, fact-finding, theological_question)
    3. Topic (e.g., faith, love, forgiveness, strength, peace, purpose, healing, creation, history)

    User Message: "${message}"

    Return ONLY a JSON object with keys: "emotion", "intent", "topic".
    Example: { "emotion": "curious", "intent": "fact-finding", "topic": "creation" }
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        return JSON.parse(text);
    } catch (error) {
        console.error("Error classifying message:", error);
        // Fallback
        return { emotion: "neutral", intent: "general", topic: "general" };
    }
}
