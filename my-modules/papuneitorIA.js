

/** @type {import('discord.js').Client} */
let client = null;
const triggerWords = ["papuneitor", "papuneitor3000", "bot"];



const { openai, generateAIReply  } = require('./openAIClient.js');


export function setClient(discordClient){
    client = discordClient;
}

/**
 * @param {import('discord.js').Message} message
 */
async function checkIfShouldParticipateInConversation(message){
    const accesToClient = client !== null;
    console.log("Do I have access to client?", accesToClient);
    if(!accesToClient) return;
    console.log("Checking if should participate in conversation...");
    const content = message.content.toLowerCase();
    const channel = message.channel;
    const author = message.author; 
    const botId = client.user.id;
    

    // Case 1: Message mentions the bot or replies to the bot
    await checkForMentionOrReply(message, botId);


    // Case 2: Message contains trigger words
    checkForTriggerWords(content);

    // Case 3: Random chance to participate
    checkRandomParticipation(message);


}




function checkRandomParticipation(message) {
    const randomChance = Math.random();
    console.log("Random chance value:", randomChance);
    if (randomChance < 0.15) {
        console.log("Participating in conversation because of random chance.");
        handleReply(message);
    }
}

async function checkForMentionOrReply(message, botId) {
    let mentioned = message.mentions.has(botId);
    console.log("Message mentions bot?", mentioned);
    if (!mentioned && message.reference) {
        try {
            const referencedMessage = await message.fetchReference();
            if (referencedMessage.author.id === botId) {
                mentioned = true;
                console.log("Message is a reply to the bot.");
            }
        } catch (error) {
            console.error("Error fetching referenced message:", error);
            return;
        }
    }

    if (mentioned) {
        console.log("Participating in conversation because I was mentioned.");
        // finish
    }
}

function checkForTriggerWords(content) {
    let containsTriggerWord = triggerWords.some(word => content.includes(word));
    console.log("Message contains trigger word?", containsTriggerWord);
    if (containsTriggerWord) {
        console.log("Participating in conversation because of trigger word.");
        // finish
    }
}

/**
 * @param {import('discord.js').Message} message
 */
async function handleReply(message) {
    
    generateAIReply(message.content).then(async (aiResponse) => {
        console.log("AI Response:", aiResponse);
        await message.channel.send(aiResponse);
    }).catch(err => {
        console.error("Error generating AI reply:", err);
    });

}