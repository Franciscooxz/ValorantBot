// src/commands/info.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

// Color azul información que solicitaste
const INFO_COLOR = 0x1E9DE3;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Muestra información sobre los comandos disponibles')
        .addStringOption(option =>
            option.setName('comando')
                .setDescription('Comando específico del que quieres información')
                .setRequired(false)
                .addChoices(
                    { name: 'agent', value: 'agent' },
                    { name: 'economy', value: 'economy' },
                    { name: 'lore', value: 'lore' },
                    { name: 'map', value: 'map' },
                    { name: 'quiz', value: 'quiz' },
                    { name: 'quizrank', value: 'quizrank' },
                    { name: 'weapon', value: 'weapon' }
                )
        ),
    
    async execute(interaction) {
        const commandName = interaction.options.getString('comando');
        
        // Si se especifica un comando, muestra la información de ese comando
        if (commandName) {
            return this.showCommandInfo(interaction, commandName);
        }
        
        // Si no se especifica un comando, muestra la lista general
        const embed = new EmbedBuilder()
            .setColor(INFO_COLOR)
            .setTitle('📚 Comandos del Bot de VALORANT')
            .setDescription('Aquí tienes información sobre todos los comandos disponibles. Usa `/info comando` para ver detalles específicos.')
            .setThumbnail('https://media.valorant-api.com/sprays/290565e7-4540-5764-31da-758846dc2a5a/displayicon.png')
            .addFields(
                { 
                    name: '🎮 Comandos de información de juego', 
                    value: 
                        '• `/agent` - Información detallada sobre agentes\n' +
                        '• `/map` - Información y estrategias de mapas\n' +
                        '• `/weapon` - Estadísticas y detalles de armas\n' +
                        '• `/economy` - Guía y tips sobre la economía del juego\n' +
                        '• `/lore` - Historia y trasfondo del universo VALORANT'
                },
                { 
                    name: '🎯 Comandos de Quiz', 
                    value: 
                        '• `/quiz` - Juega al quiz de VALORANT para poner a prueba tus conocimientos\n' +
                        '• `/quizrank` - Consulta el ranking de jugadores del quiz'
                },
                {
                    name: '💡 ¿Cómo usar los comandos?',
                    value: 'Escribe `/` seguido del nombre del comando. Sigue las instrucciones que aparecen para añadir los parámetros necesarios.'
                }
            )
            .setFooter({ text: 'VALORANT Bot | Usa /info comando para más detalles' });
        
        await interaction.reply({
            embeds: [embed]
        });
    },
    
    async showCommandInfo(interaction, commandName) {
        const commandInfo = {
            'agent': {
                title: '🧙 Comando Agent',
                description: 'Muestra información detallada sobre los agentes de VALORANT',
                usage: '`/agent nombre:Jett` - Muestra información sobre Jett\n`/agent rol:Duelista` - Muestra agentes con rol Duelista',
                examples: '`/agent nombre:Phoenix`\n`/agent rol:Controlador`',
                image: 'https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png'
            },
            'economy': {
                title: '💰 Comando Economy',
                description: 'Proporciona guías y consejos sobre la economía en VALORANT',
                usage: '`/economy` - Muestra consejos generales de economía\n`/economy tipo:básico` - Muestra guía básica de economía',
                examples: '`/economy tipo:avanzado`\n`/economy tipo:estrategias`',
                image: 'https://media.valorant-api.com/currencies/85ad4c3e-4bae-8a9c-89c4-45a4c2c296cf/displayicon.png'
            },
            'lore': {
                title: '📖 Comando Lore',
                description: 'Explora la historia y el trasfondo del universo VALORANT',
                usage: '`/lore` - Muestra un resumen del lore\n`/lore agente:Omen` - Historia de Omen',
                examples: '`/lore agente:Viper`\n`/lore evento:Primera Luz`',
                image: 'https://media.valorant-api.com/sprays/33c1f011-4eca-068a-1e00-9b9679a11630/displayicon.png'
            },
            'map': {
                title: '🗺️ Comando Map',
                description: 'Información y estrategias sobre los mapas de VALORANT',
                usage: '`/map nombre:Haven` - Muestra información sobre Haven\n`/map list` - Lista todos los mapas',
                examples: '`/map nombre:Bind`\n`/map estrategias:Ascent`',
                image: 'https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/listviewicon.png'
            },
            'quiz': {
                title: '❓ Comando Quiz',
                description: 'Juega al quiz de VALORANT para poner a prueba tus conocimientos',
                usage: '`/quiz` - Inicia una pregunta aleatoria\n`/quiz categoria:Agentes` - Pregunta sobre agentes',
                examples: '`/quiz categoria:Armas dificultad:Difícil`\n`/quiz categoria:Mapas`',
                image: 'https://media.valorant-api.com/sprays/af3a4d21-4272-e554-d356-1c97d8092200/displayicon.png'
            },
            'quizrank': {
                title: '🏆 Comando QuizRank',
                description: 'Consulta el ranking de jugadores del quiz de VALORANT',
                usage: '`/quizrank` - Muestra el ranking actual de jugadores',
                examples: '`/quizrank`',
                image: 'https://media.valorant-api.com/sprays/0cb0626c-4d34-db73-93e9-19a19a1762ca/displayicon.png'
            },
            'weapon': {
                title: '🔫 Comando Weapon',
                description: 'Estadísticas y detalles sobre las armas de VALORANT',
                usage: '`/weapon nombre:Vandal` - Muestra información sobre Vandal\n`/weapon tipo:Rifle` - Muestra rifles',
                examples: '`/weapon nombre:Operator`\n`/weapon tipo:Pistola`',
                image: 'https://media.valorant-api.com/weapons/63e6c2b6-4a8e-869c-3d4c-e38355226584/displayicon.png'
            }
        };
        
        const info = commandInfo[commandName];
        
        if (!info) {
            return interaction.reply({
                content: `Lo siento, no tengo información sobre el comando \`${commandName}\`.`,
                ephemeral: true
            });
        }
        
        const embed = new EmbedBuilder()
            .setColor(INFO_COLOR)
            .setTitle(info.title)
            .setDescription(info.description)
            .setThumbnail(info.image)
            .addFields(
                { name: '📝 Uso', value: info.usage },
                { name: '🔍 Ejemplos', value: info.examples },
                { name: '💡 Tip', value: 'Puedes usar Tab para autocompletar los parámetros cuando escribes un comando.' }
            )
            .setFooter({ text: 'VALORANT Bot | Usa /info para ver todos los comandos' });
        
        await interaction.reply({
            embeds: [embed]
        });
    }
};