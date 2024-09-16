const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Obtiene información del usuario.'),
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		await interaction.reply({content: `Este comando fue ejecutado por ${interaction.user.username}, que entró en ${interaction.member.joinedAt}.`,
								ephemeral: true});
	},
};