const { Events, ActivityType } = require('discord.js');
// TikTok removed: no longer required

const NOMBRE_MATI = "matiasvi123"; 
const CHANNEL_ID = "1407132833763426385"; 

let matiLive = false; 
// TikTok logic removed completely

async function checkKickLive(timeout = 7000) {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const res = await fetch(`https://kick.com/api/v2/channels/${NOMBRE_MATI}`, { signal: controller.signal });
        clearTimeout(id);
        if (!res.ok) return false;
        const data = await res.json();
        return !!data.livestream;
    } catch (err) {
        if (err.name === 'AbortError') {
            console.error('Timeout chequeando Kick');
        } else {
            console.error('Error chequeando Kick:', err);
        }
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
        let intervalRunning = false;
        setInterval(async () => {
            if (intervalRunning) return;
            intervalRunning = true;
            try {
                const kickLive = await checkKickLive();
                const channel = await client.channels.fetch(CHANNEL_ID);

            // --- Kick ---
            if (kickLive && !matiLive) {
                matiLive = true;
                channel.send(`🔴 ¡**${NOMBRE_MATI}** está en vivo en Kick! https://kick.com/${NOMBRE_MATI} @here`);
                client.user.setPresence({ activities: [{ name: `kick.com/${NOMBRE_MATI}`, type: ActivityType.Watching}], status: 'online' });
            } else if (!kickLive && matiLive) {
                matiLive = false;
                pickupRandomPresence(client);
            }

            }
            catch (err) {
                console.error('Error en intervalo:', err);
            }
            finally {
                intervalRunning = false;
            }

        }, 180000);
    },
};
