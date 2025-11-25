
const { OpenAI } = require("openai");
const { open_ai_apikey } = require("./config.json");



const openai = new OpenAI({
    apiKey: open_ai_apikey
});


/**
 * Llama a la IA y devuelve una respuesta simple.
 */
async function generateAIReply(userMessage) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // barato, rápido y bueno
            messages: [
                { role: "user", content: userMessage }
            ]
        });

        return completion.choices[0].message.content;
    } catch (err) {
        console.error("Error calling OpenAI:", err);
        return "Error hablando con la IA 😵‍💫";
    }
}

module.exports = {
    openai,
    generateAIReply
};