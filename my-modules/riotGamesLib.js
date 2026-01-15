
const {riot_apikey} = require("../config.json");

const prefix = "https://la2.api.riotgames.com"
const prefixAmericas= "https://americas.api.riotgames.com"
const apiSuffix = "api_key="+riot_apikey;

const cache = {
    "none": "none",
}

function addIdToCache(name, puuid){
    cache[name] = puuid;
}


async function getIDByName(name){
    if(cache[name]){
        console.log("ID ya existente en cache para " + name)
        return cache[name]
    }
    try{
        const gameName = name.split("#")[0];
        const tagline = name.split("#")[1];
        const url = prefixAmericas +`/riot/account/v1/accounts/by-riot-id/${gameName}/${tagline}?`+apiSuffix;

        const res = await fetch(url);
        if(!res.ok){
            console.log("Respuesta no ok para obtener el id por el nombre: " + await res.text())
            return null;
        }

        const data = await res.json();
        const puuid = data.puuid;
        console.log("El puuid de " + name + " es: " + puuid)
        addIdToCache(name, puuid);
        return puuid;

    } catch (err){
        console.log("Error obteniendo id por el nombre: " + err);
    }
}

async function getSoloQInfoForName(name){
    const puuid = await getIDByName(name);
    if(!puuid) return null;
    const url = prefix +`/lol/league/v4/entries/by-puuid/${puuid}?`+apiSuffix;
    const res = await fetch(url);
    if(!res.ok){
        console.log("Respuesta no ok para obtener info de la soloq por el nombre: " + await res.text())
        return null;
    }
    const raw_data = await res.json();
    let soloqData;
    for(entry of raw_data){
        if(entry.queueType == "RANKED_SOLO_5x5"){
            soloqData = entry; 
        }
    }
    if(!soloqData){
        console.log("No se encontró datos de soloq para " + name) 
    }

    // console.log("Data de soloq de " + name + ": ", soloqData)
    return soloqData;
}



module.exports = {
    getSoloQInfoForName, getIDByName
}
