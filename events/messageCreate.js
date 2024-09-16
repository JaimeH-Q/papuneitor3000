const { Events, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if(message.content.includes("<@1285038447295463476>")){
            if (message.content == "<@1285038447295463476>"){
                await YouPingedMe("only", message);
                return
            }
            await YouPingedMe("includes", message);
        }
        if(message.content.startsWith("!")){
            parseCommand(message);
            return;
        }

    },
};


async function YouPingedMe(mode, msg){
    if (mode == "only"){
        return msg.channel.send("¡Hola! En que puedo ayudarte?");
    }
    return msg.channel.send("... 👀");
}

async function parseCommand(message){
    const content = message.content.subString(1);
    const channel = message.channel;
    const author = message.author;
    switch (content){
        case "ip":
            channel.send("La ip es 1.21")

    }

}