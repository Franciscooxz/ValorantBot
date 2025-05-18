// src/commands/map.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { COLORS } = require('../config/colors');
const { createBaseEmbed } = require('../utils/embedBuilder');
const mapManager = require('../models/MapManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('map')
        .setDescription('Muestra información sobre un mapa de VALORANT')
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Nombre del mapa')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const maps = await mapManager.getAllMapNames();
        
        const filtered = maps.filter(name => 
            name.toLowerCase().includes(focusedValue)
        ).slice(0, 25);
        
        await interaction.respond(
            filtered.map(name => ({ name, value: name }))
        );
    },
    
    async execute(interaction) {
        const mapName = interaction.options.getString('nombre');
        const map = await mapManager.getMapByName(mapName);
        
        if (!map) {
            return interaction.reply({
                content: `No he podido encontrar información sobre el mapa ${mapName}. ¿Estás seguro de que has escrito bien el nombre?`,
                ephemeral: true
            });
        }
        
        // Crear el embed con la información del mapa
        const embed = createBaseEmbed({
            title: map.name,
            description: map.description,
            color: COLORS.PRIMARY,
            image: map.imageUrl,
            footer: {
                text: `Ubicación: ${map.location} | Lanzamiento: ${map.releaseDate}`
            }
        });
        
        // Añadir campos adicionales
        embed.addFields(
            { name: '🌍 Ubicación', value: map.location, inline: true },
            { name: '📅 Fecha de lanzamiento', value: map.releaseDate, inline: true },
            { name: '⚙️ Características', value: map.features, inline: false }
        );
        
        await interaction.reply({
            embeds: [embed]
        });
    }
};