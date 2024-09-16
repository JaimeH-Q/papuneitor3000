const { SlashCommandBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle, formatEmoji } = require('discord.js');
const moderationLib = require('../../my-modules/moderationlib/moderationLib.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Advierte a un usuario')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
		.addUserOption(option =>
			option.setName('usuario')
				.setDescription('El usuario a sancionar')
				.setRequired(true))
        .addStringOption(option =>
			option.setName('motivo')
				.setDescription('Motivo de la advertencia')
				.setRequired(true)),
        
	async execute(interaction) {
		const userId = interaction.options.getUser('usuario', true);
        const reason = interaction.options.getString('motivo', true);
        let formmatedReason = '`(Motivo: ' + reason + ')`';
        const moderatorUsername = interaction.user.displayName;
        if (!reason){
            formmatedReason = "`Sin motivo`";
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            console.log(`${interaction.user.name} intentó usar WARN!`);
            return;
        }

        if (userId == interaction.user){
            interaction.reply({content: `No puedes advertirte a ti mismo ${interaction.user}!`, ephemeral: true});
            return;
        }

        const response = await interaction.reply({content: `Estás seguro de querer advertir a ${userId}?`, components: [createConfirmationRow()], ephemeral: true});
        const collectorFilter = i => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
            if (confirmation.customId === 'cancel') {
                await confirmation.update({ content: 'Acción cancelada. El usuario no fue advertido.', components: [] });
                return;
            }
        } catch (e) {
            await interaction.editReply({ content: 'No confirmaste, operación cancelada.', components: [] });
            return;
        }

        try {
            await moderationLib.addPunishment(userId.username, 'warns', reason, moderatorUsername);
            await userId.send(`Recibiste una advertencia! ${formmatedReason}`);
        } catch (error){
            console.log(error);
        }
        interaction.deleteReply();
        interaction.channel.send({content: `${userId} recibió una advertencia de **${moderatorUsername}** ${formmatedReason}`});
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