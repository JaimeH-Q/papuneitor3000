const { Events, ActivityType, MessageActivityType } = require('discord.js');

const { getSoloQInfoForName } = require("../my-modules/riotGamesLib")
// TikTok removed: no longer required

const NOMBRE_MATI = "matiasvi123"; 
const CHANNEL_ID = "1407132833763426385"; 


// "IIIIIllIIIII#LAS"
const PAPUS_DEL_LOL = ["LGL iJaimexARG#SDLG","LGL OneEyedKing#DEAD","LGLnachitomack#SDLG","LGL ImFerPe#SDLG","LGL MatiASvi#7557","TSTpredictionOP#Yorsh"
    ,"OMG ÇrîmsønĄbbÿš#OMG"]

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

async function getLolTopData(){
    let data = [];
    for(papu of PAPUS_DEL_LOL){
        let soloqData = await getSoloQInfoForName(papu);
        if(soloqData) soloqData.name = papu;
        if(!soloqData) soloqData = { "name": papu}
        // console.log("soloq data de: " + papu, soloqData)
        data.push(await soloqData);
    }
    // console.log("Esta es la data de todos: ", data);

    const sortedData = sortData(data);
    return data;
}


const TIER_ORDER = {
    IRON: 1,
    BRONZE: 2,
    SILVER: 3,
    GOLD: 4,
    PLATINUM: 5,
    EMERALD: 6,
    DIAMOND: 7
};

const TRANSLATE = {
    IRON: "Hierro",
    BRONZE: "Bronce",
    SILVER: "Platita",
    GOLD: "Oro",
    PLATINUM: "Platino",
    EMERALD: "Esmeralda",
    DIAMOND: "Diamante"
};

const RANK_ORDER = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4
};

function sortData(data){
    return data.sort((a, b) => {
        // Los que no juegan soloQ van al final
        if (!a.tier && !b.tier) return 0;
        if (!a.tier) return 1;
        if (!b.tier) return -1;

        const tierA = TIER_ORDER[a.tier];
        const tierB = TIER_ORDER[b.tier];

        // 1) Ordenar por tier
        if (tierA !== tierB) {
            return tierB - tierA; // tier más alto primero
        }

        const rankA = RANK_ORDER[a.rank];
        const rankB = RANK_ORDER[b.rank];

        // 2) Dentro del mismo tier, ordenar por rank
        // I es mejor que IV, así que menor número es mejor
        if (rankA !== rankB) {
            return rankA - rankB;
        }

        // 3) Dentro del mismo tier y rank, ordenar por LP
        return b.leaguePoints - a.leaguePoints;
    });
}

async function getTopMessage(soloqData){
    let message = 
        "# <:leagueoflegends:1461245191125078069>  SoloQ Challenge de la grasa 2026 \n" +
        "-# el ganador se gana la mamá de mati\n \n";

    let position = 1;
    const validCount = soloqData.filter(d => d.leagueId).length;

    for (const data of soloqData) {
        // Caso: no jugó SoloQ
        if (!data.leagueId) {
            continue;
        }
        // Posición
        let posText = position === 1 ? "**1**" : position.toString();
        const trophy = position === 1 ? ":trophy: " : "";

        // Si es el último válido → monkeypoop
        const monkeypoop = position === validCount ? "<:cacavomito:1461261021099331615>" : "";

        const wins = data.wins;
        const losses = data.losses;
        const total = wins + losses;
        const winrate = total > 0 ? ((wins / total) * 100).toFixed(2) : "0.00";

        const fire = data.hotStreak ? " :fire:" : "";

        const elo = TRANSLATE[data.tier] + " " + data.rank + " " + data.leaguePoints + "LP"
        message += `${posText} - ${trophy}**${data.name.split("#")[0]}** \`${elo}\` (${wins}W ${losses}L ${winrate}% wr)${fire}${monkeypoop}\n`;

        position++;
    }

    message += "-# :fire: racha de +3"

    message += "\n\n"
    message += "## <:risa:1428510711822422137> Pequeños perdedores (no jugaron soloq todavía) \n"

    for(const data of soloqData){
        if (!data.leagueId) {
            message += `**--** - ${data.name} :chicken:\n`;
        }
    }



    return message;
}


let lastLolContent = null;

async function updateLolTop(client){
    const lolContent = await getLolTopData();
    
    // Lo pasamos a string para poder comparar fácil
    const newContentString = JSON.stringify(lolContent);

    if (lastLolContent === newContentString) {
        console.log("El top no cambió, no se actualiza el mensaje.");
        return;
    }

    // Si cambió, actualizamos el cache
    lastLolContent = newContentString;

    const message = await getTopMessage(lolContent);

    const channelId = "1461228635028586549";
    const channel = await client.channels.fetch(channelId);

    await channel.bulkDelete(1);
    await channel.send(message);

    console.log("Top actualizado.");
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
            //     const kickLive = await checkKickLive();
            //     const channel = await client.channels.fetch(CHANNEL_ID);
            //     // console.log(`Estado actual: Kick live: ${kickLive}, Mati live: ${matiLive}`);
            // // --- Kick ---
            // if (kickLive && !matiLive) {
            //     matiLive = true;
            //     channel.send(`🔴 ¡**${NOMBRE_MATI}** está en vivo en Kick! https://kick.com/${NOMBRE_MATI} @here`);
            //     client.user.setPresence({ activities: [{ name: `kick.com/${NOMBRE_MATI}`, type: ActivityType.Watching}], status: 'online' });
            // } else if (!kickLive && matiLive) {
            //     matiLive = false;
            //     pickupRandomPresence(client);
            // }

                pickupRandomPresence(client);

            // --- Top de lol ---
            await updateLolTop(client);


            }
            catch (err) {
                console.error('Error en intervalo:', err);
            }
            finally {
                intervalRunning = false;
            }

        // }, 180000);
        }, 30000);
        // }, 20000); // 20 segundos para pruebas
    },
};
