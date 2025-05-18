const http = require('http');

// Crear un servidor HTTP simple
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot de VALORANT está en línea!');
});

// Escuchar en el puerto que Render proporciona (o un puerto predeterminado)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor HTTP iniciado en el puerto ${PORT} - El bot permanecerá activo`);
});

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { TOKEN } = require('./src/config/botConfig');

// Crear un nuevo cliente con los permisos necesarios
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ] 
});

// Colección para almacenar los comandos
client.commands = new Collection();

// Cargar los comandos
const commandsPath = path.join(__dirname, 'src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    // Configurar comandos (si tienen método prepareCommand)
    if (command.prepareCommand) {
        command.data = command.prepareCommand();
    }
    
    // Guardar en la colección
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Comando ${command.data.name} cargado correctamente.`);
    } else {
        console.log(`⚠️ El comando en ${filePath} no tiene las propiedades 'data' o 'execute'.`);
    }
}

// Evento: cuando el bot está listo
client.once('ready', () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
    console.log(`🤖 ¡El bot está listo y sirviendo a ${client.guilds.cache.size} servidores!`);
});

// Evento: manejo de comandos de barra
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() && !interaction.isAutocomplete()) return;
    
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    
    try {
        if (interaction.isAutocomplete()) {
            if (command.autocomplete) {
                await command.autocomplete(interaction);
            }
        } else if (interaction.isCommand()) {
            await command.execute(interaction);
        }
    } catch (error) {
        console.error(`Error con el comando ${interaction.commandName}:`, error);
        
        // Responder solo si la interacción no ha sido respondida ya
        if (interaction.isCommand() && !interaction.replied && !interaction.deferred) {
            await interaction.reply({ 
                content: '¡Hubo un error al ejecutar este comando!', 
                ephemeral: true 
            });
        }
    }
});

// Iniciar sesión con el token
client.login(TOKEN);