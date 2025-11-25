const { Events, ActivityType } = require('discord.js');
// TikTok removed: no longer required

const NOMBRE_MATI = "matiasvi123"; 
const CHANNEL_ID = "1407132833763426385"; 

let matiLive = false; 
// TikTok logic removed completely

async function checkKickLive() {
    try {
        // Add browser-like headers so the request looks like it comes from a real browser
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Referer': `https://kick.com/${NOMBRE_MATI}`,
            'Origin': 'https://kick.com',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Connection': 'keep-alive',
            'DNT': '1'
        };

        const res = await fetch(`https://kick.com/api/v2/channels/${NOMBRE_MATI}`, { headers });

        if (!res.ok) {
            const body = await res.text().catch(() => '<no body>');
            console.error(`Kick API responded ${res.status}: ${String(body).slice(0,200)}`);
            return false;
        }

        const data = await res.json().catch(err => {
            console.error('Failed parsing Kick JSON:', err);
            return null;
        });

        if (!data) return false;

        // Diagnostics
        try {
            if (data.livestream) {
                console.log('Kick: livestream present; keys=', Object.keys(data.livestream));
            } else {
                console.log('Kick: no livestream field; top-level keys=', Object.keys(data));
            }
        } catch (e) {
            console.log('Kick: response type:', typeof data);
        }

        // Robust live detection: check explicit is_live, id presence, or non-empty livestream object
        const ls = data.livestream;
        const live = Boolean(
            ls && (
                ls.is_live === true ||
                ls.is_live === 'true' ||
                (typeof ls.id !== 'undefined' && ls.id !== null) ||
                (Object.keys(ls || {}).length > 0)
            )
        );

        console.log('Kick: computed live=', live);
        return live;
    } catch (err) {
        console.error('Error chequeando Kick:', err);
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
                console.log(`Estado actual: Kick live: ${kickLive}, Mati live: ${matiLive}`);
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

        // }, 180000);
        }, 20000); // 20 segundos para pruebas
    },
};
