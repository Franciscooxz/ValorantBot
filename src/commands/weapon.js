// src/commands/weapon.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { COLORS } = require('../config/colors');
const { createBaseEmbed } = require('../utils/embedBuilder');
const weaponManager = require('../models/WeaponManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weapon')
        .setDescription('Muestra información sobre un arma de VALORANT')
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Nombre del arma')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const weapons = await weaponManager.getAllWeaponNames();
        
        const filtered = weapons.filter(name => 
            name.toLowerCase().includes(focusedValue)
        ).slice(0, 25);
        
        await interaction.respond(
            filtered.map(name => ({ name, value: name }))
        );
    },
    
    async execute(interaction) {
        const weaponName = interaction.options.getString('nombre');
        const weapon = await weaponManager.getWeaponByName(weaponName);
        
        if (!weapon) {
            return interaction.reply({
                content: `No he podido encontrar información sobre el arma ${weaponName}. ¿Estás seguro de que has escrito bien el nombre?`,
                ephemeral: true
            });
        }
        
        // Crear el embed con la información del arma
        const embed = createBaseEmbed({
            title: weapon.name,
            description: weapon.description,
            color: COLORS.PRIMARY,
            thumbnail: weapon.imageUrl,
            footer: {
                text: `Tipo: ${weapon.type} | Precio: ${weapon.cost} créditos`
            }
        });
        
        // Añadir campos para las estadísticas
        embed.addFields(
            { name: '💰 Precio', value: weapon.cost, inline: true },
            { name: '🔫 Tipo', value: weapon.type, inline: true },
            { name: '📊 Daño', value: `**Cabeza:** ${weapon.damage.head}\n**Cuerpo:** ${weapon.damage.body}\n**Piernas:** ${weapon.damage.leg}`, inline: true },
            { name: '⚡ Cadencia', value: weapon.fireRate, inline: true },
            { name: '🔄 Cargador', value: weapon.magazineSize, inline: true },
            { name: '🧱 Penetración', value: weapon.wallPenetration, inline: true }
        );
        
        // Añadir modo de disparo alternativo si existe
        if (weapon.altFireMode !== "Ninguno") {
            embed.addFields({
                name: '🔄 Modo Alternativo',
                value: weapon.altFireMode,
                inline: false
            });
        }
        
        await interaction.reply({
            embeds: [embed]
        });
    }
};