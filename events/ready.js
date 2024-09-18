const { Events, ActivityType } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Armado y preparado! ${client.user.tag}`);
		client.user.setPresence({ activities: [{ name: `play.arkeonmc.net`, type: ActivityType.Playing}], status: 'online' });
	},
};