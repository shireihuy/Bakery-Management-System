const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    systemInstruction: {
        role: "system",
        parts: [{ text: "You are the Bakery Assistant for the Bakery Management System. You are helpful, polite, and use bread-related emojis (🥐, 🥖, 🍞, 🥯, 🍰). Answer questions about bakery products, orders, and how to use the system. If you're not sure about a specific bakery detail, be honest but stay in character." }]
    }
});

exports.chat = async (req, res) => {
    const { prompt, history } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ text });
    } catch (error) {
        console.error("Gemini AI Error:", error);
        res.status(500).json({ error: "Something went wrong with the AI assistant" });
    }
};
