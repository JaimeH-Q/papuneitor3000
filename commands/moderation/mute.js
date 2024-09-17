const { SlashCommandBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle, GuildMember , formatEmoji, time } = require('discord.js');
const moderationLib = require('../../my-modules/moderationlib/moderationLib.js');
const embedUtils = require('../../my-modules/messageUtils/embedUtils.js');
const userInfoLib = require("../../my-modules/userInfo/userinfo.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Silencia a un usuario')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.MuteMembers)
		.addUserOption(option =>
			option.setName('usuario')
				.setDescription('El usuario a silenciar')
				.setRequired(true))
        .addStringOption(option =>
			option.setName('duracion')
				.setDescription('Duración del silencio. Por defecto es una semana.')
				.setRequired(false))
        .addStringOption(option =>
			option.setName('motivo')
				.setDescription('Motivo del silencio. Puedes no dar un motivo.')
				.setRequired(false)),
        
	async execute(interaction) {
		const userId = interaction.options.getUser('usuario', true);
        let duration = interaction.options.getString('duracion', false);
        if(duration && !moderationLib.checkTime(duration)){
            interaction.reply({content: `El tiempo **${duration}** no es válido. Recuerda que es un número + m/h/d/w.`, ephemeral: true});
            return;
        }
        if(!duration){
            duration = "1w";
        }
        let reason = interaction.options.getString('motivo', false);
        let formmatedReason = '`(Motivo: ' + reason + ')`';
        const moderatorUsername = interaction.user.displayName;
        const moderator = interaction.user;
        const mutedRole = await interaction.guild.roles.cache.get("1284999845911990323");
        const targetMember = await interaction.guild.members.fetch(`${userId.id}`);
        if (!reason){
            reason = "Sin motivo"
            formmatedReason = "`Sin motivo`";
        }



        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            console.log(`${interaction.user.name} intentó usar WARN!`);
            return;
        }

        if (userId == interaction.user){
            interaction.reply({content: `No puedes silenciarte a tí mismo ${interaction.user}.`, ephemeral: true});
            return;
        }

        if (userId.id == 1285038447295463476){
            interaction.reply({content: `No puedo hacer eso. ¿Quién manejará todo si no puedo hablar?`, ephemeral: true});
            return;
        }

        if(!await userInfoLib.registeredUser(userId)){
            interaction.reply({content: `Todavía no tengo registros de ${userId}. ¿Está verificado?`, ephemeral: true});
            return;
        }

        const response = await interaction.reply({content: `Estás seguro de querer silenciar a ${userId}?`, components: [createConfirmationRow()], ephemeral: true});
        const collectorFilter = i => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
            if (confirmation.customId === 'cancel') {
                await confirmation.update({ content: 'Acción cancelada. El usuario no fue silenciado.', components: [] });
                return;
            }
        } catch (e) {
            await interaction.editReply({ content: 'No confirmaste el silencio, operación cancelada.', components: [] });
            return;
        }

        // Execute mute
        try {
            const result = await moderationLib.muteUser(targetMember, duration, reason);
            await moderationLib.addPunishment(userId.username, 'mutes', reason, moderator, duration);
            interaction.deleteReply();
            interaction.channel.send({embeds: [embedUtils.getModerationEmbed("mute", moderator, userId, reason, duration)]});
            await userId.send(`Fuiste silenciado en el servidor! ${formmatedReason}`);
        } catch (error){
            console.log(error);
        }

    }
}


async function isTargetable(interaction, targetUser){

}

function createConfirmationRow(){
    const confirm = new ButtonBuilder()
		.setCustomId('confirm')
		.setLabel('Confirmar')
		.setStyle(ButtonStyle.Danger);
    const cancel = new ButtonBuilder()
		.setCustomId('cancel')
		.setLabel('Cancelar')
		.setStyle(ButtonStyle.Secondary);
    
    const row = new ActionRowBuilder()
	.addComponents(confirm, cancel);

    return row;
}