const {ButtonBuilder, ActionRowBuilder, ButtonStyle} = require("discord.js");

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


module.exports = {createConfirmationRow}