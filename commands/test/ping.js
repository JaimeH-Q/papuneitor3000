const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Comprueba el estado del bot'),
	async execute(interaction) {
		await interaction.reply('Armado y preparado ' + interaction.member.displayName + ' :v');
	},
};