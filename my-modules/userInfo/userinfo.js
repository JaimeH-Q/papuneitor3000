const fs = require('fs');
const { parse } = require('path');

function readFile(){
    const allUserData = fs.readFileSync('userData.json', 'utf8', (err, data) => {
        if (err){
            console.log(err);
            return;
        }
        return data;
    })
    return allUserData;
}


async function writeUserData(userObject){
    let userData = await readFile();
    userData = await JSON.parse(userData);

    const username = Object.keys(userObject)[0];
    userData[username] = userObject[username];

    userData = await JSON.stringify(userData, null, 2);
    const response = await fs.writeFile('userData.json', userData, err => {
        if(err) throw err;
    })
    return response;
}


function addModerationPoints(user){
    let userData = readFile();
    userData = JSON.parse(userData);

    console.log(userData);
}


async function firstTimeDataSetup(user_object){
    let userData = readFile();
    userData = JSON.parse(userData);

    const initial_embed = {
        [user_object.name] : {
            'discord' : {
                'id' : [user_object.id],
                'code': ""
            }
        }
    }
}

async function addVerificationCode(user_object, code){
    let allUserData = readFile();
    allUserData = JSON.parse(userData);
    if(!allUserData || !allUserData[user_object.name]){
        firstTimeDataSetup(user_object);
    }

    userData = allUserData[user_object.name];
    userData.code = code;
    
}

module.exports = { writeUserData, readFile, firstTimeDataSetup }