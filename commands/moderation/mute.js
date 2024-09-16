const { SlashCommandBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle, formatEmoji } = require('discord.js');
const moderationLib = require('../../my-modules/moderationlib/moderationLib.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Silencia a un usuario')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
		.addUserOption(option =>
			option.setName('usuario')
				.setDescription('El usuario a silenciar')
				.setRequired(true))
        .addStringOption(option =>
			option.setName('duracion')
				.setDescription('Duración del silencio')
				.setRequired(false))
        .addStringOption(option =>
			option.setName('motivo')
				.setDescription('Motivo del silencio')
				.setRequired(false)),
        
	async execute(interaction) {
		const userId = interaction.options.getUser('usuario', true);
        //const duration = interaction.option.getString('duracion', false);
        const reason = interaction.options.getString('motivo', false);
        let formmatedReason = '`(Motivo: ' + reason + ')`';
        const moderatorUsername = interaction.user.displayName;
        const mutedRole = await interaction.guild.roles.cache.get("1284999845911990323");
        const targetMember = await interaction.guild.members.fetch(`${userId.id}`);
        if (!reason){
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
        try {
            const result = await muteUser(targetMember, mutedRole);
            await moderationLib.addPunishment(userId.username, 'mutes', reason, moderatorUsername);
            if (result == false){
                interaction.editReply({content: `El usuario ${userId} ya está silenciado!`, components: []});
                return;
            }
            interaction.deleteReply();
            interaction.channel.send({content: `${userId} fue silenciado por **${moderatorUsername}** ${formmatedReason}`});
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

async function muteUser(member, role){
    if (member.roles.cache.some(r => r.id === role.id)){
        return false;
    }
    await member.roles.add(role);
    return true;
}