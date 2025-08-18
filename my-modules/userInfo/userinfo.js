const { Console } = require('console');
const fs = require('fs').promises;
const { parse } = require('path');
const { allowedNodeEnvironmentFlags } = require('process');


const path = 'userData.json';
async function readFile() {
    try {
        return await fs.readFile(path, 'utf8');
    } catch (err) {
        if (err.code === 'ENOENT') return '{}'; // Si el archivo no existe, devuelve objeto vacío
        throw err;
    }
}

async function writeUserData(userObject) {
    let userData = await readFile();
    userData = JSON.parse(userData);

    // Agregar o actualizar datos
    for (const [key, value] of Object.entries(userObject)) {
        userData[key] = value;
    }

    const updatedData = JSON.stringify(userData, null, 2);
    await fs.writeFile(path, updatedData);
}

async function addModerationPoints(user) {
    let userData = await readFile();
    userData = JSON.parse(userData);

    console.log(userData);
    // Aquí puedes agregar puntos, por ejemplo:
    if (!userData[user.username]) userData[user.username] = {};
    userData[user.username].points = (userData[user.username].points || 0) + 1;

    await writeUserData(userData);
}

async function registeredUser(user) {
    const allUserData = await getUserData(user.username);
    if (allUserData == undefined) return false;
    return allUserData?.discord?.registered || false;
}

async function registerUser(user) {
    const allData = await getUserData(user.username) || {};
    if (!allData.discord) allData.discord = {};
    allData.discord.registered = true;
    await writeUserData({ [user.username]: allData });
}

async function getUserData(username) {
    let allUserData = await readFile();
    allUserData = JSON.parse(allUserData);
    return allUserData[username];
}

module.exports = {
    readFile,
    writeUserData,
    addModerationPoints,
    registerUser,
    registeredUser,
    getUserData
};