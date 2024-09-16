const { SlashCommandBuilder } = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Recarga un comando.')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('El comando a recargar.')
				.setRequired(true)),
	async execute(interaction) {
		const commandName = interaction.options.getString('command', true).toLowerCase();
		const command = interaction.client.commands.get(commandName);

		if (!command) {
			return interaction.reply(`No hay ningún comando llamado \`${commandName}\`!`);
		}

        const foldersPath = path.join(__dirname, '..');
        const commandFolders = fs.readdirSync(foldersPath);
        var commandFolderPath;
        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file == `${command.data.name}.js`);
            for (const file of commandFiles){
                if (file== `${command.data.name}.js`)
                {
                    commandFolderPath = folder;
                }
            }
        }
        delete require.cache[require.resolve(`../${commandFolderPath}/${command.data.name}.js`)];
        try {
	        interaction.client.commands.delete(command.data.name);
	        const newCommand = require(`../${commandFolderPath}/${command.data.name}.js`);
	        interaction.client.commands.set(newCommand.data.name, newCommand);
	        await interaction.reply(`El comando \`${newCommand.data.name}\` fue recargado!`);
		} catch (error) {
	        console.error(error);
	        await interaction.reply(`Hubo un error recargando el comando \`${command.data.name}\`:\n\`${error.message}\``);
		}
	},
};