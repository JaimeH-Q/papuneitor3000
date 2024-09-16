const fs = require('fs');
const { parse } = require('path');
const userinfolib = require('../userInfo/userinfo.js');

async function addPunishment(username, sanction, reason, moderator){
    let userinfo_file = await userinfolib.readFile();
    userinfo_file = JSON.parse(userinfo_file);
    let userinfo_sanctionNumber = userinfo_file[username]['moderationStats'][sanction];
    userinfo_file[username]['moderationStats'][sanction] = userinfo_sanctionNumber + 1;
    userinfo_file[username]['history'][sanction].push({
        "date": getDate(),
        "staff": moderator,
        "reason": reason,
    });
    
    const dataToSend = {
        [username]: userinfo_file[username]
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
module.exports = {addPunishment}