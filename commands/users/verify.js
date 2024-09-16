const { SlashCommandBuilder } = require('discord.js');
const userinfolib = require('../../my-modules/userInfo/userinfo.js');
const userRoleId = '1284999851267985491';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Verificate en el servidor. Solo es necesario usarlo la primera vez que entras.')
        .addStringOption(option =>
			option.setName('codigo')
				.setDescription('Tu código de verificación. Si no tienes uno, no coloques nada.')
				.setRequired(false)),
	async execute(interaction) {
        const input_code = interaction.options.getString('codigo', false);
        const userName = interaction.user.username;

        if (interaction.member.roles.cache.has(userRoleId)){
            await interaction.reply({content: 'Ya estás registrado. No es necesario que uses este comando de nuevo.', ephemeral: true});
            return;
        }
        
        if (input_code != undefined){
            let allUserInfo = await userinfolib.readFile();
            allUserInfo = JSON.parse(allUserInfo);
            if (input_code == allUserInfo[userName].discord.code){
                await interaction.reply({content: 'Excelente. ¡Bienvenido al servidor!', ephemeral: true});
                await interaction.member.roles.add(userRoleId);
                return;
            }

            interaction.reply({content: 'Mhmm... Parece que no es tu código. Vuelve a intentarlo.', ephemeral: true});
            return;
        }
        

        const user_code = getRandomString(5);
        const formattedCode = '`' + user_code + '`';
        try {
            if (await isNewUser(userName)){
                await interaction.user.send(`Saludos. Tu código secreto es ${formattedCode}`);
                await interaction.user.send(`Si el código no funciona, puedes usar nuevamente el comando.`);
                await firstTimeSetup(interaction.user, user_code);
            } else {
                await interaction.user.send(`* Tu nuevo código de verificación es ${formattedCode}`);
                let allUserInfo = JSON.parse(await userinfolib.readFile());
                allUserInfo = allUserInfo[userName];
                allUserInfo.discord.code = user_code;
                let dataToSend = {
                    [userName]: allUserInfo
                }
                await userinfolib.writeUserData(dataToSend);
            }
        } catch (e) {
            console.log(e);
            await interaction.reply({content: 'Tus DM están desactivados.', ephemeral: true});
            return;
        }

        await interaction.reply({content: 'Revisa tus DM. Si los tienes desactivados, áctivalos y vuelve a intentar.', ephemeral: true});



    }
}


function getRandomString(final_length){
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxy'
    let counter = 0;
    while (counter < final_length) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
        counter += 1;
      }
      return result;
}

async function isNewUser(interaction_user){
    let allData = await userinfolib.readFile();
    allData = await JSON.parse(allData);

    if (allData[interaction_user] == undefined){
        return true;
    }

    return false;
}


async function firstTimeSetup(interaction_user, code){
    const dataObject = {
        [interaction_user.username] : {
            'discord':{
                'id': interaction_user.id,
                'code': code
            },
            'moderationStats':{
                'moderationPoints': 0,
                'warns': 0,
                'mutes': 0,
                'kicks': 0,
                'bans': 0,
            },
            'history':{
                'bans': [],
                'kicks': [],
                'mutes': [],
                'warns': []
            },
            'minecraft':{
                
            }

        }
    }

    await userinfolib.writeUserData(dataObject);
}