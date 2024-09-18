const { SlashCommandBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle, formatEmoji } = require('discord.js');
const moderationLib = require('../../my-modules/moderationlib/moderationLib.js');
const embedUtils = require('../../my-modules/messageUtils/embedUtils.js');
const userInfoLib = require('../../my-modules/userInfo/userinfo.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Expulsa a un usuario')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
		.addUserOption(option =>
			option.setName('usuario')
				.setDescription('El usuario a expulsar.')
				.setRequired(true))
        .addStringOption(option =>
			option.setName('motivo')
				.setDescription('Motivo de la expulsión, en caso de haberlo.')
				.setRequired(false)),
        
	async execute(interaction) {
		const userId = interaction.options.getUser('usuario', true);
        let reason = interaction.options.getString('motivo', false);
        let formmatedReason = '`(Motivo: ' + reason + ')`';
        const moderator = interaction.user;
        const moderatorUsername = interaction.user.displayName;
        if (!reason){
            reason = "Sin motivo"
            formmatedReason = "`Sin motivo`";
        }


        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            console.log(`${interaction.user.name} intentó usar kick!`);
            return;
        }

        if (userId == interaction.user){
            interaction.reply({content: `No puedes expulsarte a ti mismo ${interaction.user}!`, ephemeral: true});
            return;
        }

        if (userId.id == 1285038447295463476){
            interaction.reply({content: `No... creo que estás olvidando quién manda por aquí.`, ephemeral: true});
            return;
        }

        if(!await userInfoLib.registeredUser(userId)){
            interaction.reply({content: `Todavía no tengo registros de ${userId}. Si no está verificado, expúlsalo manualmente.`, ephemeral: true});
            return;
        }

        const targetMember = interaction.guild.members.cache.get(userId.id);
        const targetHasAdminPermission = targetMember.permissions.has(PermissionsBitField.Flags.Administrator);

        if(targetHasAdminPermission){
            interaction.reply({content: `No puedes expulsar a **${targetMember.user}**. Es un administrador del servidor.`, ephemeral: true});  
            return;
        }

        const response = await interaction.reply({content: `Estás seguro de querer expulsar a ${userId}?`, components: [createConfirmationRow()], ephemeral: true});
        const collectorFilter = i => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
            if (confirmation.customId === 'cancel') {
                await confirmation.update({ content: 'Acción cancelada. El usuario no fue expulsado.', components: [] });
                return;
            }
        } catch (e) {
            await interaction.editReply({ content: 'No confirmaste la expulsión, operación cancelada.', components: [] });
            return;
        }

        try {
            await moderationLib.addPunishment(userId.username, 'kicks', reason, moderator, null);
            await userId.send(`Fuiste expulsado del servidor! ${formmatedReason}`);
            const kickResult = await interaction.guild.members.kick(userId);
        } catch (error){
            if (error.code == 50013){
                interaction.editReply({content: `No puedo kickear a ${userId}! Tiene un rol más alto que el mío.`});
                return;
            }
            console.log(error);
        }

        await interaction.channel.send({embeds: [embedUtils.getModerationEmbed("kick", moderator, userId, reason, null)]});
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