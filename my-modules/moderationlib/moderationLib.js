const fs = require('fs');
const { parse } = require('path');
const userinfolib = require('../userInfo/userinfo.js');

async function addPunishment(username, sanction, reason, moderator, time){
    if(moderator.id){
        moderator = moderator.globalName;
    }
    let userinfo_file = await userinfolib.readFile();
    userinfo_file = JSON.parse(userinfo_file);
    let userinfo_sanctionNumber = userinfo_file[moderator.username]['moderationStats'][sanction];
    userinfo_file[moderator.username]['moderationStats'][sanction] = userinfo_sanctionNumber + 1;
    userinfo_file[username]['history'][sanction].push({
        "date": getDate(),
        "staff": moderator,
        "reason": reason,
        "time": time
    });
    
    const dataToSend = {
        [username]: userinfo_file[username],
        [moderator.username]: userinfo_file[moderator.username]
    }

    await userinfolib.writeUserData(dataToSend);
}

function getDate(){
    const getYear = new Date().getFullYear();
    const getMonth = new Date().getUTCMonth();
    const getDay = new Date().getUTCDate();
    
    const formattedDate = `${getDay}/${getMonth}/${getYear}`;
    return formattedDate;
}

function getTimeToMinutes(raw_time){
    timeInMinutes = 0;
    splitMessages = raw_time.split(' ');
    splitMessages.forEach(message => {
        if(message.includes("w")){
            timeInMinutes += parseInt(message.replace("w", ""))  * 10080;
        }
        if(message.includes("d")){
            timeInMinutes += parseInt(message.replace("d", "")) * 1440;
        }
        if(message.includes("h")){
            timeInMinutes += parseInt(message.replace("h", "")) * 60;
        }
        if(message.includes("m")){
            timeInMinutes += parseInt(message.replace("m", ""));
        }
    })

    return timeInMinutes;
}


function checkTime(raw_time) {
    // Expresión regular para validar el formato "número + w/d/h/m", separado por espacios
    const timePattern = /^(\d+w|\d+d|\d+h|\d+m)(\s\d+w|\s\d+d|\s\d+h|\s\d+m)*$/;

    // Comprobar si el formato coincide con la expresión regular
    return timePattern.test(raw_time);
}

async function muteUser(member, raw_time, reason){
    let timeInMinutes = raw_time;
    if(raw_time){
        timeInMinutes = getTimeToMinutes(raw_time) * 60 * 1000;
    }
    return member.timeout(timeInMinutes, reason);
}

module.exports = {addPunishment, checkTime, muteUser}