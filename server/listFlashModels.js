const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + process.env.GEMINI_API_KEY);
        const data = await response.json();
        if (data.models) {
            const flashModels = data.models.filter(m => m.name.includes('flash') && m.supportedGenerationMethods.includes('generateContent'));
            console.log(JSON.stringify(flashModels.map(m => m.name), null, 2));
        } else {
            console.log("No models found or error:", data);
        }
    } catch (err) {
        console.error(err);
    }
}

listModels();
