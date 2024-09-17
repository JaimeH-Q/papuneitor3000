const { Events } = require('discord.js');
const userInfoLib = require("../my-modules/userInfo/userinfo.js");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction){
		if (interaction.isChatInputCommand()){
			const command = interaction.client.commands.get(interaction.commandName);
			if (!command) {
				console.error(`No se encontró el comando ${interaction.commandName}.`);
				return;
			}
			if(!await userInfoLib.registeredUser(interaction.user) && interaction.commandName != "verify"){
				await interaction.reply({content: 'No estás verificado en el servidor. No puedes hacer esto.', ephemeral: true});
				return;
			}
			
			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'Hubo un error ejecutando este comando.', ephemeral: true });
				} else {
					await interaction.reply({ content: 'Hubo un error ejecutando este comando.', ephemeral: true });
				}
			}
		} else if (interaction.isButton()) {
			
		} else if (interaction.isStringSelectMenu()) {
		}
	}
}