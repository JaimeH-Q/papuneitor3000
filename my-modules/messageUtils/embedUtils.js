const { EmbedBuilder } = require('discord.js');
const messageUtils = require('./messageUtils');


function getModerationEmbed(type, moderator, user, reason, time){
    type = type.toLowerCase();
    switch (type){
        case "warn":
            return getWarnEmbed(moderator, user, reason, time);
        case "mute":
            return getMuteEmbed(moderator, user, reason, time);
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

function getMuteEmbed(moderator, user, reason, time){
    fields = [{ name: 'Usuario', value: `<@${user.id}>`, inline: true },{name: 'Motivo', value: reason, inline: true }];
    if(time){
        fields.push({ name: 'Duración', value: `${messageUtils.formatTime(time)}`, inline: false })
    }
    return new EmbedBuilder()
        .setColor(0xf5a856)
        .setFooter({ text: "Moderador: "+moderator.displayName, iconURL: moderator.avatarURL()})
        .setTitle(":mute: Usuario muteado")
        .addFields(fields)
}


module.exports = {getModerationEmbed, }