const { SlashCommandBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle, formatEmoji } = require('discord.js');
const moderationLib = require('../../my-modules/moderationlib/moderationLib.js');

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
        const reason = interaction.options.getString('motivo', false);
        let formmatedReason = '`(Motivo: ' + reason + ')`';
        const moderatorUsername = interaction.user.displayName;
        if (!reason){
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
            await moderationLib.addPunishment(userId.username, 'kicks');
            await userId.send(`Fuiste expulsado del servidor! ${formmatedReason}`);
            const kickResult = await interaction.guild.members.kick(userId);
        } catch (error){
            console.log(error);
            if (error.code == 50013){
                interaction.editReply({content: `No puedo kickear a ${userId}! Tiene un rol más alto que el mío.`});
                return;
            }
        }

        if (reason == null){
            interaction.deleteReply();
            interaction.channel.send({content: `${userId} fue explulsado por **${moderatorUsername}**.`, components: []});
            return;
        }
        interaction.deleteReply();
        interaction.channel.send({content: `${userId} fue explulsado por **${moderatorUsername}** ${formmatedReason}`});
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