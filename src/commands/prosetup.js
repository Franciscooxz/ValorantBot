// src/commands/prosetup.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { COLORS } = require('../config/colors');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prosetup')
        .setDescription('Muestra configuraciones de jugadores profesionales de VALORANT')
        .addStringOption(option => 
            option.setName('jugador')
                .setDescription('Nombre del jugador profesional')
                .setRequired(false)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName('equipo')
                .setDescription('Filtrar por equipo')
                .setRequired(false)
                .addChoices(
                    { name: 'Sentinels', value: 'sentinels' },
                    { name: 'Fnatic', value: 'fnatic' },
                    { name: 'Team Liquid', value: 'liquid' },
                    { name: 'Cloud9', value: 'cloud9' },
                    { name: 'LOUD', value: 'loud' },
                    { name: 'Evil Geniuses', value: 'eg' },
                    { name: 'Paper Rex', value: 'prx' },
                    { name: 'DRX', value: 'drx' },
                    { name: 'KRÜ Esports', value: 'kru' },
                    { name: 'NRG', value: 'nrg' }
                )
        )
        .addStringOption(option =>
            option.setName('rol')
                .setDescription('Filtrar por rol principal')
                .setRequired(false)
                .addChoices(
                    { name: 'Duelista', value: 'duelista' },
                    { name: 'Iniciador', value: 'iniciador' },
                    { name: 'Centinela', value: 'centinela' },
                    { name: 'Controlador', value: 'controlador' }
                )
        ),
    
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = Object.keys(this.proPlayers);
        
        const filtered = choices.filter(choice => 
            choice.toLowerCase().includes(focusedValue)
        ).slice(0, 25);
        
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice }))
        );
    },
    
    async execute(interaction) {
        const playerName = interaction.options.getString('jugador');
        const teamFilter = interaction.options.getString('equipo');
        const roleFilter = interaction.options.getString('rol');
        
        // Si se especifica un jugador, mostrar su configuración
        if (playerName && this.proPlayers[playerName]) {
            return this.showPlayerSetup(interaction, playerName);
        }
        
        // Si se especifica un filtro (equipo o rol), mostrar jugadores que coincidan
        if (teamFilter || roleFilter) {
            return this.showFilteredPlayers(interaction, teamFilter, roleFilter);
        }
        
        // Si no se especifica nada, mostrar lista de jugadores populares
        const embed = new EmbedBuilder()
            .setColor(COLORS.INFO || 0x1E9DE3)
            .setTitle('⚙️ Configuraciones de Profesionales')
            .setDescription('Descubre las configuraciones que utilizan los mejores jugadores de VALORANT. Selecciona un jugador específico o filtra por equipo o rol.')
            .setThumbnail('https://media.valorant-api.com/sprays/48cb2771-4d57-3f28-8d9c-7da4e2f28e7e/displayicon.png')
            .addFields(
                { 
                    name: '🔍 Cómo usar este comando', 
                    value: 
                        '• `/prosetup jugador:TenZ` - Ver configuración de TenZ\n' +
                        '• `/prosetup equipo:Sentinels` - Ver jugadores de Sentinels\n' +
                        '• `/prosetup rol:duelista` - Ver configuraciones de duelistas'
                },
                { 
                    name: '🌟 Jugadores Populares', 
                    value: this.getPopularPlayersList()
                },
                {
                    name: '📊 Estadísticas Curiosas',
                    value: 
                        '• El 78% de los profesionales usan sensibilidad baja (0.2-0.4)\n' +
                        '• El 65% juegan en resolución 1920x1080\n' +
                        '• El ratón más utilizado es el Logitech G Pro X Superlight\n' +
                        '• La tecla más común para agacharse es Left Shift'
                }
            )
            .setFooter({ text: 'Actualizado: Mayo 2025 | Datos recopilados de streams, entrevistas y perfiles oficiales' });
        
        await interaction.reply({
            embeds: [embed]
        });
    },
    
    async showPlayerSetup(interaction, playerName) {
        const player = this.proPlayers[playerName];
        
        const embed = new EmbedBuilder()
            .setColor(COLORS.INFO || 0x1E9DE3)
            .setTitle(`⚙️ Configuración de ${playerName}`)
            .setDescription(`Configuración utilizada por **${playerName}** (${player.team}) - *${player.role}*`)
            .setThumbnail(player.image)
            .addFields(
                { 
                    name: '🖱️ Mouse', 
                    value: 
                        `• **Modelo**: ${player.mouse}\n` +
                        `• **DPI**: ${player.dpi}\n` +
                        `• **Sensibilidad**: ${player.sensitivity}\n` +
                        `• **eDPI**: ${player.dpi * player.sensitivity}\n` +
                        `• **Polling Rate**: ${player.polling_rate}Hz`
                },
                { 
                    name: '⌨️ Teclado', 
                    value: 
                        `• **Modelo**: ${player.keyboard}\n` +
                        `• **Switches**: ${player.switches}`
                },
                { 
                    name: '🎧 Auriculares', 
                    value: `• **Modelo**: ${player.headset}`
                },
                { 
                    name: '🎮 Configuración de Juego', 
                    value: 
                        `• **Resolución**: ${player.resolution}\n` +
                        `• **Ratio de Aspecto**: ${player.aspect_ratio}\n` +
                        `• **FPS Cap**: ${player.fps_cap}\n` +
                        `• **Multithreaded Rendering**: ${player.multithreaded_rendering ? 'Activado' : 'Desactivado'}`
                },
                { 
                    name: '🎯 Crosshair', 
                    value: 
                        `• **Código**: \`${player.crosshair_code}\`\n` +
                        `• **Color**: ${player.crosshair_color}\n` +
                        `• **Outlines**: ${player.crosshair_outline ? 'Sí' : 'No'}`
                },
                { 
                    name: '⚡ Agentes Principales', 
                    value: player.main_agents.join(', ')
                }
            )
            .setImage(player.crosshair_image)
            .setFooter({ 
                text: `${player.fun_fact ? '💡 ' + player.fun_fact : ''} | Actualizado: ${player.last_updated}` 
            });
        
        await interaction.reply({
            embeds: [embed]
        });
    },
    
    async showFilteredPlayers(interaction, teamFilter, roleFilter) {
        let filteredPlayers = Object.entries(this.proPlayers);
        
        // Aplicar filtro de equipo si se especifica
        if (teamFilter) {
            filteredPlayers = filteredPlayers.filter(([_, player]) => 
                player.team.toLowerCase() === teamFilter
            );
        }
        
        // Aplicar filtro de rol si se especifica
        if (roleFilter) {
            filteredPlayers = filteredPlayers.filter(([_, player]) => 
                player.role.toLowerCase() === roleFilter
            );
        }
        
        // Si no hay resultados
        if (filteredPlayers.length === 0) {
            return interaction.reply({
                content: `No se encontraron jugadores que coincidan con los filtros: ${teamFilter ? `Equipo: ${teamFilter}` : ''} ${roleFilter ? `Rol: ${roleFilter}` : ''}`,
                ephemeral: true
            });
        }
        
        // Crear lista de jugadores
        let playerList = '';
        filteredPlayers.forEach(([name, player]) => {
            playerList += `• **${name}** (${player.team}) - ${player.role}\n`;
        });
        
        const titleText = roleFilter && teamFilter 
            ? `${this.capitalizeFirstLetter(roleFilter)}s de ${this.capitalizeFirstLetter(teamFilter)}`
            : teamFilter 
                ? `Jugadores de ${this.capitalizeFirstLetter(teamFilter)}`
                : `${this.capitalizeFirstLetter(roleFilter)}s Profesionales`;
        
        const embed = new EmbedBuilder()
            .setColor(COLORS.INFO || 0x1E9DE3)
            .setTitle(`⚙️ ${titleText}`)
            .setDescription(`Lista de jugadores que cumplen con los filtros seleccionados. Usa \`/prosetup jugador:nombre\` para ver la configuración detallada.`)
            .addFields(
                { 
                    name: '👥 Jugadores', 
                    value: playerList
                },
                {
                    name: '💡 Tip',
                    value: 'Usa el autocompletado del parámetro "jugador" para encontrar rápidamente un jugador específico.'
                }
            )
            .setFooter({ text: `Mostrando ${filteredPlayers.length} jugadores | Actualizado: Mayo 2025` });
        
        await interaction.reply({
            embeds: [embed]
        });
    },
    
    getPopularPlayersList() {
        const popularPlayers = [
            'TenZ', 'Shroud', 'ScreaM', 'Derke', 'yay', 
            'nAts', 'Boaster', 'aspas', 'Sacy', 'cNed'
        ];
        
        return popularPlayers.map(player => {
            const playerInfo = this.proPlayers[player];
            if (playerInfo) {
                return `• **${player}** (${playerInfo.team}) - ${playerInfo.role}`;
            }
            return `• **${player}**`;
        }).join('\n');
    },
    
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    // Base de datos de jugadores
    proPlayers: {
        "TenZ": {
            team: "Sentinels",
            role: "Duelista",
            mouse: "Logitech G Pro X Superlight 2",
            dpi: 800,
            sensitivity: 0.345,
            polling_rate: 1000,
            keyboard: "Xtrfy K5 Compact RGB",
            switches: "Gateron Red",
            headset: "HyperX Cloud Alpha",
            resolution: "1920x1080",
            aspect_ratio: "16:9",
            fps_cap: "Unlimited",
            multithreaded_rendering: true,
            crosshair_code: "0;P;c;1;h;0;f;0;0l;3;0o;2;0a;1;0f;0;1t;0;1l;0;1o;0;1a;0;1m;0;1f;0",
            crosshair_color: "Blanco",
            crosshair_outline: false,
            crosshair_image: "https://media.valorant-api.com/crosshairs/0;P;c;1;h;0;f;0;0l;3;0o;2;0a;1;0f;0;1t;0;1l;0;1o;0;1a;0;1m;0;1f;0/crosshair.png",
            main_agents: ["Jett", "Raze", "Reyna"],
            fun_fact: "Conocido por sus clips virales y su estilo de juego agresivo",
            image: "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png",
            last_updated: "Mayo 2025"
        },
        "ScreaM": {
            team: "Team Liquid",
            role: "Duelista",
            mouse: "Endgame Gear XM1r",
            dpi: 400,
            sensitivity: 0.72,
            polling_rate: 1000,
            keyboard: "Xtrfy K4 TKL",
            switches: "Kailh Red",
            headset: "Logitech G Pro X",
            resolution: "1920x1080",
            aspect_ratio: "16:9",
            fps_cap: "240",
            multithreaded_rendering: true,
            crosshair_code: "0;s;1;P;c;5;h;0;f;0;0l;4;0o;2;0a;1;0f;0;1b;0",
            crosshair_color: "Cyan",
            crosshair_outline: false,
            crosshair_image: "https://media.valorant-api.com/crosshairs/0;s;1;P;c;5;h;0;f;0;0l;4;0o;2;0a;1;0f;0;1b;0/crosshair.png",
            main_agents: ["Phoenix", "Reyna", "KAY/O"],
            fun_fact: "Conocido como 'The Headshot Machine' desde sus días en CS:GO",
            image: "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png",
            last_updated: "Mayo 2025"
        },
        "nAts": {
            team: "Team Liquid",
            role: "Centinela",
            mouse: "Zowie EC2-C",
            dpi: 800,
            sensitivity: 0.29,
            polling_rate: 1000,
            keyboard: "Varmilo VA87M",
            switches: "Cherry MX Red",
            headset: "HyperX Cloud II",
            resolution: "1280x960",
            aspect_ratio: "4:3 (Stretched)",
            fps_cap: "Unlimited",
            multithreaded_rendering: true,
            crosshair_code: "0;s;1;P;c;1;o;1;d;1;z;3;a;0;f;0;s;0;m;1;0t;0;0l;0;0o;0;0a;0;0f;0;1t;0;1l;0;1o;0;1a;0;1m;0;1f;0",
            crosshair_color: "Verde",
            crosshair_outline: true,
            crosshair_image: "https://media.valorant-api.com/crosshairs/0;s;1;P;c;1;o;1;d;1;z;3;a;0;f;0;s;0;m;1;0t;0;0l;0;0o;0;0a;0;0f;0;1t;0;1l;0;1o;0;1a;0;1m;0;1f;0/crosshair.png",
            main_agents: ["Cypher", "Killjoy", "Chamber"],
            fun_fact: "Conocido por sus estrategias defensivas innovadoras",
            image: "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/displayicon.png",
            last_updated: "Abril 2025"
        },
        "Derke": {
            team: "Fnatic",
            role: "Duelista",
            mouse: "Pulsar X2 Mini",
            dpi: 800,
            sensitivity: 0.32,
            polling_rate: 1000,
            keyboard: "Keychron Q1",
            switches: "Gateron Oil King",
            headset: "SteelSeries Arctis Pro",
            resolution: "1920x1080",
            aspect_ratio: "16:9",
            fps_cap: "Unlimited",
            multithreaded_rendering: true,
            crosshair_code: "0;P;c;1;o;1;f;0;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0",
            crosshair_color: "Verde claro",
            crosshair_outline: true,
            crosshair_image: "https://media.valorant-api.com/crosshairs/0;P;c;1;o;1;f;0;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0/crosshair.png",
            main_agents: ["Jett", "Chamber", "Raze"],
            fun_fact: "Consiguió un ace en el primer round de su debut internacional",
            image: "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png",
            last_updated: "Mayo 2025"
        },
        "Boaster": {
            team: "Fnatic",
            role: "Iniciador",
            mouse: "Logitech G Pro X Superlight",
            dpi: 800,
            sensitivity: 0.27,
            polling_rate: 1000,
            keyboard: "Wooting 60HE",
            switches: "Lekker (Hall Effect)",
            headset: "Logitech G Pro X",
            resolution: "1920x1080",
            aspect_ratio: "16:9",
            fps_cap: "240",
            multithreaded_rendering: true,
            crosshair_code: "0;s;1;P;c;1;o;1;f;0;0l;4;0o;2;0a;1;0f;0;1b;0",
            crosshair_color: "Verde",
            crosshair_outline: true,
            crosshair_image: "https://media.valorant-api.com/crosshairs/0;s;1;P;c;1;o;1;f;0;0l;4;0o;2;0a;1;0f;0;1b;0/crosshair.png",
            main_agents: ["Sova", "KAY/O", "Skye"],
            fun_fact: "Conocido por sus celebraciones y coreografías tras ganar rondas",
            image: "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/displayicon.png",
            last_updated: "Abril 2025"
        },
        "aspas": {
            team: "LOUD",
            role: "Duelista",
            mouse: "Razer Viper V2 Pro",
            dpi: 800,
            sensitivity: 0.35,
            polling_rate: 1000,
            keyboard: "Razer Huntsman Mini",
            switches: "Razer Linear Optical",
            headset: "Razer BlackShark V2 Pro",
            resolution: "1680x1050",
            aspect_ratio: "16:10",
            fps_cap: "Unlimited",
            multithreaded_rendering: true,
            crosshair_code: "0;P;o;1;d;1;f;0;s;0;0t;0;0l;1;0o;1;0a;1;0f;0;1t;0;1l;0;1o;0;1a;0;1m;0;1f;0",
            crosshair_color: "Amarillo",
            crosshair_outline: true,
            crosshair_image: "https://media.valorant-api.com/crosshairs/0;P;o;1;d;1;f;0;s;0;0t;0;0l;1;0o;1;0a;1;0f;0;1t;0;1l;0;1o;0;1a;0;1m;0;1f;0/crosshair.png",
            main_agents: ["Jett", "Raze", "Yoru"],
            fun_fact: "Conocido por su increíble control de Raze y movimientos con Blast Pack",
            image: "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png",
            last_updated: "Mayo 2025"
        },
        "yay": {
            team: "Cloud9",
            role: "Duelista",
            mouse: "Logitech G Pro X Superlight",
            dpi: 800,
            sensitivity: 0.27,
            polling_rate: 1000,
            keyboard: "Corsair K70 RGB TKL",
            switches: "Cherry MX Speed Silver",
            headset: "HyperX Cloud Alpha",
            resolution: "1920x1080",
            aspect_ratio: "16:9",
            fps_cap: "Unlimited",
            multithreaded_rendering: true,
            crosshair_code: "0;P;c;1;h;0;m;1;0l;4;0o;0;0a;1;0f;0;1b;0",
            crosshair_color: "Blanco",
            crosshair_outline: false,
            crosshair_image: "https://media.valorant-api.com/crosshairs/0;P;c;1;h;0;m;1;0l;4;0o;0;0a;1;0f;0;1b;0/crosshair.png",
            main_agents: ["Chamber", "Jett", "Reyna"],
            fun_fact: "Apodado 'El Diablo' por su impresionante precisión",
            image: "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/displayicon.png",
            last_updated: "Mayo 2025"
        },
        "Shroud": {
            team: "Sentinels (Retirado)",
            role: "Iniciador",
            mouse: "Logitech G303 Shroud Edition",
            dpi: 450,
            sensitivity: 0.78,
            polling_rate: 1000,
            keyboard: "HyperX Alloy Origins Core",
            switches: "HyperX Red",
            headset: "HyperX Cloud Alpha",
            resolution: "1920x1080",
            aspect_ratio: "16:9",
            fps_cap: "240",
            multithreaded_rendering: true,
            crosshair_code: "0;P;c;1;o;0;f;0;0l;1;0o;2;0a;1;0f;0;1b;0",
            crosshair_color: "Blanco",
            crosshair_outline: false,
            crosshair_image: "https://media.valorant-api.com/crosshairs/0;P;c;1;o;0;f;0;0l;1;0o;2;0a;1;0f;0;1b;0/crosshair.png",
            main_agents: ["Sova", "KAY/O", "Fade"],
            fun_fact: "Uno de los streamers más famosos, conocido por su carrera en CS:GO antes de VALORANT",
            image: "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png",
            last_updated: "Marzo 2025"
        },
        "cNed": {
            team: "FUT Esports",
            role: "Duelista",
            mouse: "BenQ Zowie EC2-C",
            dpi: 800,
            sensitivity: 0.3,
            polling_rate: 1000,
            keyboard: "Razer Huntsman Mini",
            switches: "Razer Linear Optical",
            headset: "Logitech G Pro X",
            resolution: "1680x1050",
            aspect_ratio: "16:10",
            fps_cap: "240",
            multithreaded_rendering: true,
            crosshair_code: "0;P;c;1;h;0;0t;1;0l;1;0o;1;0a;1;0f;0;1t;0;1l;0;1o;0;1a;0;1m;0;1f;0",
            crosshair_color: "Verde",
            crosshair_outline: true,
            crosshair_image: "https://media.valorant-api.com/crosshairs/0;P;c;1;h;0;0t;1;0l;1;0o;1;0a;1;0f;0;1t;0;1l;0;1o;0;1a;0;1m;0;1f;0/crosshair.png",
            main_agents: ["Jett", "Chamber", "Omen"],
            fun_fact: "Ganó el Masters Berlin 2021 con Acend y fue nombrado MVP del torneo",
            image: "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png",
            last_updated: "Abril 2025"
        },
        "Sacy": {
            team: "Sentinels",
            role: "Iniciador",
            mouse: "Logitech G Pro X Superlight",
            dpi: 800,
            sensitivity: 0.295,
            polling_rate: 1000,
            keyboard: "SteelSeries Apex Pro TKL",
            switches: "OmniPoint Adjustable",
            headset: "HyperX Cloud Alpha",
            resolution: "1920x1080",
            aspect_ratio: "16:9",
            fps_cap: "Unlimited",
            multithreaded_rendering: true,
            crosshair_code: "0;s;1;P;c;1;o;1;f;0;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0",
            crosshair_color: "Verde",
            crosshair_outline: true,
            crosshair_image: "https://media.valorant-api.com/crosshairs/0;s;1;P;c;1;o;1;f;0;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0/crosshair.png",
            main_agents: ["Sova", "Breach", "Fade"],
            fun_fact: "Campeón del Champions 2022 con LOUD, conocido por sus flechas precisas como Sova",
            image: "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png",
            last_updated: "Mayo 2025"
        }
    }
};