require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({});

    async function main() {
        const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: 'Say hello in one short sentence.',
    });
    console.log(response.text);
}

    main();