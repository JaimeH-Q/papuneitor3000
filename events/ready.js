const { Events, ActivityType } = require('discord.js');
const { WebcastPushConnection } = require('tiktok-live-connector');

const NOMBRE_MATI = "matiasvi123"; 
const NOMBRE_FER = "imferpe05"
const CHANNEL_ID = "1407132833763426385"; 

let matiLive = false; 
let ferLive = false;
let ferOfflineFails = 0; // contador de intentos fallidos

async function checkTikTokLive() {
    return new Promise(resolve => {
        const conn = new WebcastPushConnection(NOMBRE_FER);
        console.log("Probando a fer...")

        conn.connect().then(state => {
            console.log("Se detectó a fer en vivo :V")
            console.log("Room info owner: " + state.roomInfo?.owner + " streamid: " + state.roomInfo?.streamId);
            // ⚠ Verificación adicional: si no hay streamId, no está en vivo
            if (state.roomInfo?.owner && state.roomInfo?.streamId) {
                conn.disconnect();
                resolve(true);
            } else {
                conn.disconnect();
                resolve(false);
            }
        }).catch(err => {
            console.log("Falló: " + err)

            resolve(false);
        });
    });
}

async function checkKickLive() {
    try {
        const res = await fetch(`https://kick.com/api/v2/channels/${NOMBRE_MATI}`);
        const data = await res.json();
        if (data.livestream) {
            return true;
        }
        return false;
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

            // --- Kick ---
            if (kickLive && !matiLive) {
                matiLive = true;
                channel.send(`🔴 ¡**${NOMBRE_MATI}** está en vivo en Kick! https://kick.com/${NOMBRE_MATI} @here`);
                client.user.setPresence({ activities: [{ name: `kick.com/${NOMBRE_MATI}`, type: ActivityType.Watching}], status: 'online' });
            } else if (!kickLive && matiLive) {
                matiLive = false;
                if (!ferLive) pickupRandomPresence(client);
            }

            // --- TikTok con intentos ---
            if (tiktokLive) {
                ferOfflineFails = 0; // reseteamos intentos fallidos
                if (!ferLive) {
                    ferLive = true;
                    channel.send(`🔴 ¡**${NOMBRE_FER}** está en vivo en TikTok! https://www.tiktok.com/@${NOMBRE_FER} @here`);
                    client.user.setPresence({ activities: [{ name: `tiktok.com/@${NOMBRE_FER}`, type: ActivityType.Watching}], status: 'online' });
                }
            } else {
                if (ferLive) {
                    ferOfflineFails++;
                    console.log(`Fer no detectado en TikTok, intento ${ferOfflineFails}/3`);
                    if (ferOfflineFails >= 3) {
                        ferLive = false;
                        ferOfflineFails = 0;
                        if (!matiLive) pickupRandomPresence(client);
                        console.log("Fer marcado como offline después de 3 intentos fallidos.");
                    }
                }
            }

        }, 60000);
    },
};
