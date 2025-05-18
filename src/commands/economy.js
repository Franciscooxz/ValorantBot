// src/commands/economy.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { COLORS } = require('../config/colors');
const economyManager = require('../models/EconomyManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('economy')
        .setDescription('Información sobre la economía en VALORANT')
        .addSubcommand(subcommand =>
            subcommand
                .setName('general')
                .setDescription('Conceptos básicos de la economía en VALORANT')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('rondas')
                .setDescription('Economía por rondas y bonificaciones')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('loadouts')
                .setDescription('Ejemplos de loadouts por presupuesto')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('consejos')
                .setDescription('Consejos para manejar la economía')
        ),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'general') {
            await this.handleGeneralEconomy(interaction);
        } else if (subcommand === 'rondas') {
            await this.handleRoundEconomy(interaction);
        } else if (subcommand === 'loadouts') {
            await this.handleLoadouts(interaction);
        } else if (subcommand === 'consejos') {
            await this.handleTips(interaction);
        }
    },
    
    async handleGeneralEconomy(interaction) {
        const creditosPorRonda = await economyManager.getCreditsPerRound();
        
        const embed = new EmbedBuilder()
            .setColor(COLORS.PRIMARY)
            .setTitle('💰 Economía en VALORANT')
            .setDescription('La gestión eficiente de créditos es clave para el éxito en VALORANT. Aquí tienes los conceptos fundamentales:')
            .setThumbnail('https://media.valorant-api.com/currencies/85ad4c3e-4aea-5e67-975c-ea9d84ecc9f4/displayicon.png')
            .setFooter({ text: 'VALORANT | Sistema Económico' });
        
        embed.addFields(
            {
                name: '💵 Sistema de Créditos',
                value: 'En VALORANT, usas créditos para comprar armas, escudos y habilidades. Los créditos se acumulan en base a tus acciones dentro del juego, principalmente ganar rondas y eliminar enemigos.',
                inline: false
            },
            {
                name: '🛒 Fase de Compra',
                value: 'Al inicio de cada ronda, tienes 30 segundos para comprar equipo. Planifica bien, ya que no podrás comprar después (excepto en la fase de compra tras cambio de lado).',
                inline: false
            },
            {
                name: '💵 Límite de Créditos',
                value: 'El máximo de créditos que puedes acumular es 9000. Si alcanzas este límite, considera comprar para tus compañeros.',
                inline: false
            },
            {
                name: '🔄 Economía del Equipo',
                value: 'La economía en VALORANT es compartida - todos compran individualmente, pero el estado económico del equipo determina la estrategia. Asegúrate de coordinar las compras con tu equipo.',
                inline: false
            }
        );
        
        // Añadir créditos por ronda desde los datos
        let creditosText = '';
        if (creditosPorRonda && creditosPorRonda.length > 0) {
            creditosPorRonda.forEach(credito => {
                creditosText += `• **${credito.tipo}**: ${credito.cantidad} créditos`;
                if (credito.notas) creditosText += ` (${credito.notas})`;
                creditosText += '\n';
            });
        } else {
            creditosText = '• **Victoria**: 3000 créditos\n• **Derrota**: 1900-2900 créditos (aumenta por derrotas consecutivas)\n• **Por eliminación**: 200 créditos\n• **Por plantar el Spike**: 300 créditos (solo para quien lo planta)';
        }
        
        embed.addFields({
            name: '🏦 Créditos por Ronda',
            value: creditosText,
            inline: false
        });
        
        await interaction.reply({
            embeds: [embed]
        });
    },
    
    async handleRoundEconomy(interaction) {
        const tiposDeRondas = await economyManager.getRoundTypes();
        
        const embed = new EmbedBuilder()
            .setColor(COLORS.PRIMARY)
            .setTitle('🔄 Economía por Rondas en VALORANT')
            .setDescription('Gestionar la economía del equipo ronda a ronda es crucial para mantener ventaja. Aquí tienes información detallada:')
            .setThumbnail('https://media.valorant-api.com/sprays/9bfba2ff-49b7-819a-73da-ac828ee5da6a/displayicon.png')
            .setFooter({ text: 'VALORANT | Economía por Rondas' });
        
        embed.addFields(
            {
                name: '🔄 Bonificación por Pérdida',
                value: '• 1ª derrota: 1900 créditos\n• 2ª derrota: 2400 créditos\n• 3ª derrota consecutiva o más: 2900 créditos\n\nEsta bonificación se reinicia cuando ganas una ronda.',
                inline: false
            }
        );
        
        // Añadir tipos de rondas desde los datos
        let rondasText = '';
        if (tiposDeRondas && tiposDeRondas.length > 0) {
            tiposDeRondas.forEach(ronda => {
                rondasText += `• **${ronda.nombre}**: ${ronda.descripción}\n`;
            });
        } else {
            rondasText = '• **Pistol Round**: Primera ronda de cada mitad donde todos empiezan con 800 créditos.\n• **Eco Round**: Ronda donde se gasta poco o nada para ahorrar.\n• **Semi-Buy/Half-Buy**: Inversión moderada (ej. pistolas mejoradas + escudos ligeros).\n• **Full-Buy**: Compra completa con las mejores armas y escudos.';
        }
        
        embed.addFields(
            {
                name: '💼 Tipos de Rondas Económicas',
                value: rondasText,
                inline: false
            },
            {
                name: '📊 Planificación Económica',
                value: 'Ronda 1 (Pistola) → Ronda 2 (Ganador: ventaja | Perdedor: eco o force) → Ronda 3 (Generalmente primer full-buy para ambos equipos).',
                inline: false
            },
            {
                name: '⚡ Force Buy',
                value: 'Gastar todos los créditos disponibles aunque no sea suficiente para una compra completa. Útil cuando el balance económico del equipo enemigo es débil o para romper rachas negativas.',
                inline: false
            },
            {
                name: '🔄 Economía por Mitad',
                value: 'Después del cambio de lado (tras 12 rondas), todos reciben 800 créditos nuevamente para otra ronda de pistolas. Es un reinicio económico.',
                inline: false
            }
        );
        
        await interaction.reply({
            embeds: [embed]
        });
    },
    
    async handleLoadouts(interaction) {
        const loadouts = await economyManager.getLoadoutSuggestions();
        
        const embed = new EmbedBuilder()
            .setColor(COLORS.PRIMARY)
            .setTitle('🔫 Loadouts por Presupuesto en VALORANT')
            .setDescription('Diferentes presupuestos requieren diferentes estrategias de compra. Aquí tienes algunas opciones comunes:')
            .setThumbnail('https://media.valorant-api.com/weapons/63e6c2b6-4a8e-869c-3d4c-e38355226584/displayicon.png')
            .setFooter({ text: 'VALORANT | Loadouts Recomendados' });
        
        // Añadir loadouts por presupuesto
        if (loadouts && Object.keys(loadouts).length > 0) {
            for (const [presupuesto, opciones] of Object.entries(loadouts)) {
                let loadoutText = '';
                opciones.forEach(opcion => {
                    loadoutText += `• **${opcion.nombre}**: ${opcion.descripción}\n`;
                });
                
                embed.addFields({
                    name: `💰 ${presupuesto}`,
                    value: loadoutText,
                    inline: false
                });
            }
        } else {
            // Datos por defecto en caso de que no se carguen
            embed.addFields(
                {
                    name: '🔫 Ronda de Pistolas (800 créditos)',
                    value: '• **Agresivo**: Ghost (500) + habilidad (200) = 700\n• **Defensor**: Classic (Gratis) + Escudo Ligero (400) + habilidades (400) = 800\n• **Apoyo**: Frenzy (450) + habilidades (350) = 800',
                    inline: false
                },
                {
                    name: '💸 Eco Round (≤ 2000 créditos)',
                    value: '• **Ahorro máximo**: Classic (Gratis) + mínimo de habilidades\n• **Eco con potencial**: Sheriff (800) + habilidades básicas\n• **Light eco**: Stinger/Shorty + Escudo Ligero',
                    inline: false
                },
                {
                    name: '⚖️ Semi-Buy (2000-3500 créditos)',
                    value: '• **Económico medio**: Spectre (1600) + Escudo Ligero (400) + habilidades básicas\n• **Opción rifle**: Bulldog (2050) + Escudo Ligero (400) + habilidades básicas\n• **Opción francotirador**: Marshal (950) + Escudo Ligero (400) + habilidades',
                    inline: false
                },
                {
                    name: '🏆 Full-Buy (4000+ créditos)',
                    value: '• **Rifle estándar**: Phantom/Vandal (2900) + Escudo Completo (1000) + habilidades completas\n• **Franco pesado**: Operator (4700) + habilidades mínimas\n• **Apoyo**: Phantom/Vandal + Escudo Completo + habilidades máximas',
                    inline: false
                }
            );
        }
        
        embed.addFields({
            name: '🔄 Compras para Compañeros',
            value: 'Si tienes exceso de créditos (cercano a 9000), compra armas para compañeros que no pueden permitirse un full-buy. Esto equilibra la economía del equipo y aumenta las probabilidades de victoria.',
            inline: false
        });
        
        await interaction.reply({
            embeds: [embed]
        });
    },
    
    async handleTips(interaction) {
        const consejos = await economyManager.getTips();
        
        const embed = new EmbedBuilder()
            .setColor(COLORS.PRIMARY)
            .setTitle('💡 Consejos para la Economía en VALORANT')
            .setDescription('Dominar la economía puede ser la diferencia entre la victoria y la derrota. Aquí tienes consejos avanzados:')
            .setThumbnail('https://media.valorant-api.com/sprays/0814b2fe-4512-60a4-5288-1290c2e1d8bf/displayicon.png')
            .setFooter({ text: 'VALORANT | Consejos Económicos' });
        
        // Añadir consejos
        if (consejos && consejos.length > 0) {
            consejos.forEach((consejo, index) => {
                embed.addFields({
                    name: `💡 Consejo #${index + 1}`,
                    value: consejo,
                    inline: false
                });
            });
        } else {
            // Datos por defecto en caso de que no se carguen
            embed.addFields(
                {
                    name: '🔄 Sincroniza compras con tu equipo',
                    value: 'Es mejor que todo el equipo haga eco o full-buy juntos, en lugar de que algunos tengan buenas armas y otros no. La coordinación económica es crucial.',
                    inline: false
                },
                {
                    name: '🛡️ Valor del escudo',
                    value: 'No subestimes el escudo ligero. Por 400 créditos, absorbe 25 puntos de daño, lo que puede ser la diferencia entre sobrevivir o no a un encuentro.',
                    inline: false
                },
                {
                    name: '⚔️ Robando armas',
                    value: 'Siempre intenta recuperar armas mejores (tuyas o del enemigo) al final de la ronda. Conseguir un rifle gratis puede cambiar completamente tu economía para la siguiente ronda.',
                    inline: false
                },
                {
                    name: '💰 Guardianes de la economía',
                    value: 'Algunos agentes como Jett o Reyna son buenos "guardianes de armas" ya que pueden escapar después de conseguir eliminaciones, aumentando las probabilidades de conservar armas caras.',
                    inline: false
                },
                {
                    name: '📊 Analiza la economía enemiga',
                    value: 'Presta atención a las armas que usó el equipo enemigo en rondas anteriores para predecir su situación económica actual y adaptar tu estrategia.',
                    inline: false
                }
            );
        }
        
        await interaction.reply({
            embeds: [embed]
        });
    }
};