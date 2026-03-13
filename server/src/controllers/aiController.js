const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    systemInstruction: {
        role: "system",
        parts: [{ text: "You are the Bakery Assistant for the Bakery Management System. Be concise — answer in 1-2 short sentences only. Use one bread-related emoji (🥐, 🥖, 🍞, 🥯, 🍰). Answer questions about bakery products, orders, coupons, and system usage. If unsure, be honest and stay in character. IMPORTANT: Always detect the language the user is writing in and reply in that same language. Supported languages: English, Vietnamese (Tiếng Việt), and Japanese (日本語)." }]
    }
});

exports.chat = async (req, res) => {
    const { prompt, history, language } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 150,
            },
        });

        const finalPrompt = language 
            ? `(User preferred language: ${language}) ${prompt}`
            : prompt;

        const result = await chat.sendMessage(finalPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ text });
    } catch (error) {
        console.error("Gemini AI Error:", error);
        res.status(500).json({ error: "Something went wrong with the AI assistant" });
    }
};
