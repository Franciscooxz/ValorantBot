// deploy-commands.js (en la carpeta raíz del proyecto)
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');
const { TOKEN, CLIENT_ID, GUILD_ID } = require('./src/config/botConfig');

const commands = [];
const commandsPath = path.join(__dirname, 'src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log('🔄 Cargando comandos para registro...');

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    // Configurar comandos (si tienen método prepareCommand)
    if (command.prepareCommand) {
        command.data = command.prepareCommand();
    }
    
    if ('data' in command) {
        commands.push(command.data.toJSON());
        console.log(`✓ Comando "${command.data.name}" añadido para registro.`);
    } else {
        console.log(`⚠️ El comando en ${filePath} no tiene la propiedad 'data'.`);
    }
}

const rest = new REST({ version: '9' }).setToken(TOKEN);

(async () => {
    try {
        console.log('🚀 Comenzando el registro de comandos de aplicación (/)...');

        let response;
        
        if (GUILD_ID) {
            // Registrar comandos en un servidor específico (más rápido para desarrollo)
            console.log(`👉 Registrando comandos en el servidor: ${GUILD_ID}`);
            response = await rest.put(
                Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
                { body: commands },
            );
            console.log('✅ Comandos registrados exitosamente en el servidor de desarrollo.');
        } else {
            // Registrar comandos globalmente (puede tomar hasta una hora en actualizarse)
            console.log('👉 Registrando comandos globalmente (puede tomar hasta una hora)');
            response = await rest.put(
                Routes.applicationCommands(CLIENT_ID),
                { body: commands },
            );
            console.log('✅ Comandos registrados exitosamente de forma global.');
        }
        
        console.log(`🎉 Se han registrado ${response.length} comandos.`);
    } catch (error) {
        console.error('❌ Error al registrar comandos:', error);
    }
})();