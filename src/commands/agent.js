// src/commands/agent.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { COLORS } = require('../config/colors');
const { createBaseEmbed } = require('../utils/embedBuilder');
const agentManager = require('../models/AgentManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('agent')
        .setDescription('Muestra información sobre un agente de VALORANT')
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Nombre del agente')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const agents = await agentManager.getAllAgentNames();
        
        const filtered = agents.filter(name => 
            name.toLowerCase().includes(focusedValue)
        ).slice(0, 25);
        
        await interaction.respond(
            filtered.map(name => ({ name, value: name }))
        );
    },
    
    async execute(interaction) {
        const agentName = interaction.options.getString('nombre');
        const agent = await agentManager.getAgentByName(agentName);
        
        if (!agent) {
            return interaction.reply({
                content: `No he podido encontrar información sobre el agente ${agentName}. ¿Estás seguro de que has escrito bien el nombre?`,
                ephemeral: true
            });
        }
        
        // Crear el embed con la información del agente
        const embed = createBaseEmbed({
            title: `${agent.name} | ${agent.role}`,
            description: agent.biography,
            color: COLORS.PRIMARY,
            thumbnail: agent.imageUrl,
            footer: {
                text: `VALORANT Bot | Tipo: ${agent.role}`
            }
        });
        
        // Añadir campos para las habilidades
        embed.addFields(
            { name: '🔹 ' + agent.abilities.basic1.name, value: agent.abilities.basic1.description, inline: false },
            { name: '🔹 ' + agent.abilities.basic2.name, value: agent.abilities.basic2.description, inline: false },
            { name: '🔸 ' + agent.abilities.signature.name + ' (Firma)', value: agent.abilities.signature.description, inline: false },
            { name: '⚡ ' + agent.abilities.ultimate.name + ' (Ultimate)', value: agent.abilities.ultimate.description, inline: false }
        );
        
        await interaction.reply({
            embeds: [embed]
        });
    }
};