const { Events, ActivityType, MessageActivityType, time, TimestampStyles } = require('discord.js');

const { getSoloQInfoForName } = require("../my-modules/riotGamesLib")
// TikTok removed: no longer required

const NOMBRE_MATI = process.env.TWITCH_CHANNEL || "matiasvi123"; 
const CHANNEL_ID = "1407132833763426385"; 


// "IIIIIllIIIII#LAS"
const PAPUS_DEL_LOL = ["LGL iJaimexARG#SDLG","LGL iNeedResets#AGAIN","LGLnachitomack#SDLG","LGL ImFerPe#SDLG","LGL MatiASvi#7557"]

let matiLive = false;

async function checkTwitchLive() {
    try {
        const res = await fetch(`https://decapi.me/twitch/uptime/${encodeURIComponent(NOMBRE_MATI)}`);

        if (!res.ok) {
            const body = await res.text().catch(() => '<no body>');
            console.error(`DecAPI respondió ${res.status}: ${String(body).slice(0, 200)}`);
            return false;
        }

        const status = (await res.text()).trim().toLowerCase();
        return !status.includes("offline");
    } catch (err) {
        console.error('Error chequeando Twitch mediante DecAPI:', err);
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
    const validCount = soloqData.filter(d => d.queueType === "RANKED_SOLO_5x5").length;

    for (const data of soloqData) {
        // Caso: no jugó SoloQ
        if (data.queueType !== "RANKED_SOLO_5x5") {
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
        if (data.queueType !== "RANKED_SOLO_5x5") {
            message += `**--** - ${data.name} :chicken:\n`;
        }
    }

    message += "\n"

    const date = new Date(); // Current time
    const relativeTime = time(date, TimestampStyles.RelativeTime); // e.g., "5 minutes ago"

    message += "-# Última actualización: " + relativeTime



    return message;
}


let lastLolContent = null;

const TOP_MESSAGE_ID = "1461461961702117476";

async function updateLolTop(client){
    const lolContent = await getLolTopData();
    
    // Lo pasamos a string para poder comparar fácil
    const newContentString = JSON.stringify(lolContent);

    if (lastLolContent === newContentString) {
        return;
    }

    // Si cambió, actualizamos el cache
    lastLolContent = newContentString;

    const messageContent = await getTopMessage(lolContent);

    const channelId = "1461228635028586549";
    const channel = await client.channels.fetch(channelId);
    const prevMessage = await channel.messages.fetch(TOP_MESSAGE_ID);
    await prevMessage.edit(messageContent);
    //await channel.send(messageContent);

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
                const twitchLive = await checkTwitchLive();
                const channel = await client.channels.fetch(CHANNEL_ID);
                if (twitchLive && !matiLive) {
                    matiLive = true;
                    await channel.send(`🔴 ¡**${NOMBRE_MATI}** está en vivo en Kick! https://kick.com/${NOMBRE_MATI} @here`);
                    client.user.setPresence({ activities: [{ name: `kick.com/${NOMBRE_MATI}`, type: ActivityType.Watching }], status: 'online' });
                } else if (!twitchLive && matiLive) {
                    matiLive = false;
                    pickupRandomPresence(client);
                }

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
        }, 60000);
        // }, 20000); // 20 segundos para pruebas
    },
};
