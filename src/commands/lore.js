// src/commands/lore.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { COLORS } = require('../config/colors');
const { createBaseEmbed } = require('../utils/embedBuilder');
const loreManager = require('../models/LoreManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lore')
        .setDescription('Muestra información sobre la historia de VALORANT')
        .addSubcommand(subcommand =>
            subcommand
                .setName('general')
                .setDescription('Información general sobre el universo de VALORANT')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('agente')
                .setDescription('Historia de un agente específico')
                .addStringOption(option =>
                    option.setName('nombre')
                        .setDescription('Nombre del agente')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('timeline')
                .setDescription('Muestra la línea de tiempo de eventos importantes')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('relaciones')
                .setDescription('Muestra las relaciones entre agentes')
                .addStringOption(option =>
                    option.setName('agente')
                        .setDescription('Filtrar por un agente específico (opcional)')
                        .setRequired(false)
                        .setAutocomplete(true)
                )
        ),
    
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const focusedValue = focusedOption.value.toLowerCase();
        
        if (focusedOption.name === 'nombre' || focusedOption.name === 'agente') {
            const agentes = await loreManager.getAllAgentsLore();
            const nombres = agentes.map(agent => agent.nombre);
            
            const filtered = nombres.filter(nombre => 
                nombre.toLowerCase().includes(focusedValue)
            ).slice(0, 25);
            
            await interaction.respond(
                filtered.map(nombre => ({ name: nombre, value: nombre }))
            );
        }
    },
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'general') {
            await this.handleGeneralLore(interaction);
        } else if (subcommand === 'agente') {
            const agentName = interaction.options.getString('nombre');
            await this.handleAgentLore(interaction, agentName);
        } else if (subcommand === 'timeline') {
            await this.handleTimeline(interaction);
        } else if (subcommand === 'relaciones') {
            const agentName = interaction.options.getString('agente');
            await this.handleRelationships(interaction, agentName);
        }
    },
    
    async handleGeneralLore(interaction) {
        const mainLore = await loreManager.getMainLore();
        
        if (!mainLore || Object.keys(mainLore).length === 0) {
            return interaction.reply({
                content: 'No se ha podido encontrar información sobre el lore general de VALORANT.',
                ephemeral: true
            });
        }
        
        const embed = createBaseEmbed({
            title: mainLore.titulo,
            description: mainLore.descripcion,
            color: COLORS.PRIMARY,
            footer: {
                text: 'VALORANT Lore | Historia General'
            }
        });
        
        // Añadir campo para Primera Luz
        embed.addFields({
            name: `☀️ ${mainLore.eventoFundamental.nombre} (${mainLore.eventoFundamental.año})`,
            value: mainLore.eventoFundamental.descripcion,
            inline: false
        });
        
        // Añadir facciones principales
        mainLore.facciones.forEach(faccion => {
            embed.addFields({
                name: `🏛️ ${faccion.nombre}`,
                value: faccion.descripcion,
                inline: false
            });
        });
        
        // Añadir campo sobre radianita
        embed.addFields({
            name: '💎 Radianita',
            value: mainLore.tecnologia.radianita,
            inline: false
        });
        
        await interaction.reply({
            embeds: [embed]
        });
    },
    
    async handleAgentLore(interaction, agentName) {
        const agentLore = await loreManager.getAgentLore(agentName);
        
        if (!agentLore) {
            return interaction.reply({
                content: `No se ha podido encontrar información sobre la historia de ${agentName}.`,
                ephemeral: true
            });
        }
        
        const embed = createBaseEmbed({
            title: `${agentLore.nombre} | Historia`,
            description: agentLore.historia,
            color: COLORS.PRIMARY,
            footer: {
                text: `Origen: ${agentLore.origen} | Tipo: ${agentLore.tipo}`
            }
        });
        
        // Añadir campo para afiliación
        embed.addFields({
            name: '🏢 Afiliación',
            value: agentLore.afiliacion,
            inline: true
        });
        
        // Añadir rol si existe
        if (agentLore.rol) {
            embed.addFields({
                name: '🧩 Rol',
                value: agentLore.rol,
                inline: true
            });
        }
        
        // Añadir conexiones con otros agentes
        if (agentLore.conexiones && agentLore.conexiones.length > 0) {
            embed.addFields({
                name: '🔗 Conexiones',
                value: agentLore.conexiones.join(', '),
                inline: false
            });
        }
        
        await interaction.reply({
            embeds: [embed]
        });
    },
    
    async handleTimeline(interaction) {
        const timeline = await loreManager.getTimelineEvents();
        
        if (!timeline || timeline.length === 0) {
            return interaction.reply({
                content: 'No se ha podido encontrar información sobre la línea de tiempo de VALORANT.',
                ephemeral: true
            });
        }
        
        const embed = createBaseEmbed({
            title: 'Línea de Tiempo de VALORANT',
            description: 'Eventos importantes en orden cronológico',
            color: COLORS.PRIMARY,
            footer: {
                text: 'VALORANT Lore | Timeline'
            }
        });
        
        // Filtrar eventos fundamentales e importantes para no saturar el embed
        const keyEvents = timeline.filter(event => 
            event.importancia === 'Fundamental' || event.importancia === 'Alta'
        );
        
        // Añadir eventos importantes
        keyEvents.forEach(event => {
            embed.addFields({
                name: `📅 ${event.año} - ${event.evento}`,
                value: event.descripcion,
                inline: false
            });
        });
        
        await interaction.reply({
            embeds: [embed]
        });
    },
    
    async handleRelationships(interaction, agentName) {
        let relationships;
        
        if (agentName) {
            relationships = await loreManager.getAgentRelationships(agentName);
            if (!relationships || relationships.length === 0) {
                return interaction.reply({
                    content: `No se ha podido encontrar información sobre las relaciones de ${agentName}.`,
                    ephemeral: true
                });
            }
        } else {
            relationships = await loreManager.getAllRelationships();
            if (!relationships || relationships.length === 0) {
                return interaction.reply({
                    content: 'No se ha podido encontrar información sobre las relaciones entre agentes.',
                    ephemeral: true
                });
            }
        }
        
        const title = agentName 
            ? `Relaciones de ${agentName}` 
            : 'Relaciones entre Agentes';
        
        const embed = createBaseEmbed({
            title,
            description: 'Vínculos y conexiones notables entre agentes',
            color: COLORS.PRIMARY,
            footer: {
                text: 'VALORANT Lore | Relaciones'
            }
        });
        
        // Limitar a 10 relaciones para no saturar el embed
        const displayRelationships = relationships.slice(0, 10);
        
        // Añadir relaciones
        displayRelationships.forEach(relation => {
            embed.addFields({
                name: `${relation.agentes[0]} & ${relation.agentes[1]} - ${relation.tipo}`,
                value: relation.descripcion,
                inline: false
            });
        });
        
        // Si hay más relaciones, indicarlo
        if (relationships.length > 10) {
            embed.addFields({
                name: '⚠️ Hay más relaciones',
                value: `Se muestran 10 de ${relationships.length} relaciones.`,
                inline: false
            });
        }
        
        await interaction.reply({
            embeds: [embed]
        });
    }
};