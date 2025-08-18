const { Events, ActivityType } = require('discord.js');
const { WebcastPushConnection } = require('tiktok-live-connector');


const NOMBRE_MATI = "matiasvi123"; // usuario de kick
const NOMBRE_FER = "imferpe"
const CHANNEL_ID = "1407132833763426385"; // canal donde avisar

let matiLive = false; // para no spamear
let ferLive = false;


async function checkTikTokLive() {
		// console.log("Chequeando tiktok de fer...")
    return new Promise(resolve => {
        const conn = new WebcastPushConnection(NOMBRE_FER);

        conn.connect().then(state => {
            conn.disconnect();
            resolve(true);
        }).catch(err => {
            resolve(false);
        });
    });
}


async function checkKickLive() {
    try {
        const res = await fetch(`https://kick.com/api/v2/channels/${NOMBRE_MATI}`);
        const data = await res.json();
		// console.log("Chequeando live...")
        if (data.livestream) {
            return true; // está en vivo
        }
        return false; // no está en vivo
    } catch (err) {
        console.error("Error chequeando Kick:", err);
        return false;
    }
}



module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Armado y preparado! ${client.user.tag}`);
		client.user.setPresence({ activities: [{ name: `League of legends`, type: ActivityType.Playing}], status: 'online' });


		console.log("Iniciando intérvalo :v")
		setInterval(async () => {
			const kickLive = await checkKickLive();
			const tiktokLive = await checkTikTokLive();
			const channel = await client.channels.fetch(CHANNEL_ID);

			if (kickLive && !matiLive) {
				matiLive = true;
				channel.send(`🔴 ¡**${NOMBRE_MATI}** está en vivo en Kick! https://kick.com/${NOMBRE_MATI} @here`);
				client.user.setPresence({ activities: [{ name: `kick.com/matiasvi123`, type: ActivityType.Watching}], status: 'online' });
			} else if (!kickLive) {
				matiLive = false;
				client.user.setPresence({ activities: [{ name: `Valorant`, type: ActivityType.Playing}], status: 'online' });
			}

			if (tiktokLive && !ferLive) {
				ferLive = true;
				channel.send(`🔴 ¡**${NOMBRE_FER}** está en vivo en TikTok! https://www.tiktok.com/@${NOMBRE_FER} @here`);
				client.user.setPresence({ activities: [{ name: `tiktok.com/@imferpe`, type: ActivityType.Watching}], status: 'online' });
			} else if (!tiktokLive) {
				ferLive = false;
				client.user.setPresence({ activities: [{ name: `League of legends`, type: ActivityType.Playing}], status: 'online' });
			
			}
		}, 5000);

		},
};