const { Events, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
import { checkIfShouldParticipateInConversation } from '../my-modules/papuneitorIA.js';


module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if(message.content.includes("<@1402735495196315678>")){
            if (message.content == "<@1402735495196315678>"){
                await YouPingedMe("only", message);
                return
            }
            await YouPingedMe("includes", message);
            return;
        }
        if(message.content.startsWith("!")){
            parseCommand(message);
            return;
        }
        

        checkIfShouldParticipateInConversation(message);

    },
};


async function YouPingedMe(mode, msg){
    if (mode == "only"){
        return msg.channel.send("Hola " + msg.author.displayName + ", que querés?");
    }
    return msg.channel.send("... 👀");
}

async function parseCommand(message){
    const content = message.content.slice(1);
    const channel = message.channel;
    const author = message.author;
    switch (content){
        case "kick":
            channel.send("<:kick:1402749765199859773> https://kick.com/matiasvi123");
        case "redes":
            channel.send("https://www.instagram.com/matiasvi123/ \n https://www.tiktok.com/@matiasvi123?lang=es \n https://www.youtube.com/@matiasvi123");


    }
}

