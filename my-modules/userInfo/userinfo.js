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
    userData = JSON.parse(userData);

    // Iterar sobre todas las claves del userObject y agregar/actualizar en userData
    for (const [key, value] of Object.entries(userObject)) {
        userData[key] = value;
    }

    // Convertir de nuevo a JSON y escribir en el archivo
    const updatedData = JSON.stringify(userData, null, 2);
    return await fs.writeFile('userData.json', updatedData, err => {
        if (err) throw err;
    });
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

async function registeredUser(user){
    if(await getUserData(user.username)){
        return true;
    }
    return false;
}

async function getUserData(username){
    let allUserData = readFile();
    allUserData = JSON.parse(allUserData);
    return allUserData[username];
}

module.exports = { writeUserData, readFile, firstTimeDataSetup, registeredUser }