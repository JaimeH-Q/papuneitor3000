const { EmbedBuilder } = require('discord.js');


function getModerationEmbed(type, moderator, user, reason, time){
    type = type.toLowerCase();
    template = {
        "warn" :  getWarnEmbed(moderator, user, reason, time),
    }

    return template[type];
}

function getWarnEmbed(moderator, user, reason, time){
    return new EmbedBuilder()
        .setColor(0xf5a856)
        .setFooter({ text: "Moderador: "+moderator.displayName, iconURL: moderator.avatarURL()})
        .setTitle(":warning: Nueva advertencia")
        .addFields(
            { name: 'Advertido', value: `<@${user.id}>`, inline: true },
            { name: 'Motivo', value: reason, inline: true },
        )
        //.setThumbnail(user.avatarURL())
}


module.exports = {getModerationEmbed}