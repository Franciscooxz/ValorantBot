// src/config/botConfig.js
module.exports = {
    // Token del bot (obtenido de Discord Developer Portal)
    TOKEN: process.env.BOT_TOKEN || 'token_para_desarrollo_local',
    
    // ID de la aplicación de Discord
    CLIENT_ID: process.env.CLIENT_ID || 'client_id_para_desarrollo_local',
    
    // ID de tu servidor (para pruebas locales)
    GUILD_ID: process.env.GUILD_ID || 'guild_id_para_desarrollo_local',
    
    // Prefijo para comandos
    PREFIX: "/"
};