const { Events, ActivityType } = require('discord.js');
const { WebcastPushConnection } = require('tiktok-live-connector');


const NOMBRE_MATI = "matiasvi123"; // usuario de kick
const NOMBRE_FER = "imferpe05"
const CHANNEL_ID = "1407132833763426385"; // canal donde avisar

let matiLive = false; // para no spamear
let ferLive = false;


async function checkTikTokLive() {
		// console.log("Chequeando tiktok de fer...")
    return new Promise(resolve => {
        const conn = new WebcastPushConnection(NOMBRE_FER);
		
        conn.connect().then(state => {
            conn.disconnect();
			console.log("fer está en vivo")
            resolve(true);
        }).catch(err => {
			console.log("fer no está en vivo")
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

const juegos = [
    "League of Legends",
    "Minecraft",
    "Valorant",
];

function getRandomJuego() {
    return juegos[Math.floor(Math.random() * juegos.length)];
}

async function pickupRandomPresence(client) {
    client.user.setPresence({ 
        activities: [{ name: getRandomJuego(), type: ActivityType.Playing }],
        status: 'online' 
    });
}



module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Armado y preparado! ${client.user.tag}`);
		pickupRandomPresence(client);


		console.log("Iniciando intérvalo :v")
		setInterval(async () => {
			const kickLive = await checkKickLive();
			const tiktokLive = await checkTikTokLive();
			const channel = await client.channels.fetch(CHANNEL_ID);

			if (kickLive && !matiLive) {
				matiLive = true;
				channel.send(`🔴 ¡**${NOMBRE_MATI}** está en vivo en Kick! https://kick.com/${NOMBRE_MATI} @here`);
				client.user.setPresence({ activities: [{ name: `kick.com/matiasvi123`, type: ActivityType.Watching}], status: 'online' });
			 } else if (!kickLive && matiLive) {
                matiLive = false;
                // Solo cambiar presencia si el otro no está en vivo
                if (!ferLive) pickupRandomPresence(client);
            }g

			if (tiktokLive && !ferLive) {
				ferLive = true;
				channel.send(`🔴 ¡**${NOMBRE_FER}** está en vivo en TikTok! https://www.tiktok.com/@${NOMBRE_FER} @here`);
				client.user.setPresence({ activities: [{ name: `tiktok.com/@imferpe`, type: ActivityType.Watching}], status: 'online' });
			} else if (!tiktokLive && ferLive) {
                ferLive = false;
                // Solo cambiar presencia si el otro no está en vivo
                if (!matiLive) pickupRandomPresence(client);
            }
		}, 60000);

		},
};