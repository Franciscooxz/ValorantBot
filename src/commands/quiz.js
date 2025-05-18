// src/commands/quiz.js (modificado)
const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const quizManager = require('../models/QuizManager');
const { CATEGORIES } = require('../config/quizConfig'); // Importando CATEGORIES
const { COLORS } = require('../config/colors');

// Aumentado a 60000 ms (1 minuto)
const ANSWER_TIMEOUT = 60000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quiz')
        .setDescription('Juega al quiz de VALORANT')
        .addStringOption(option =>
            option.setName('categoria')
                .setDescription('Categoría de preguntas')
                .setRequired(false)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName('dificultad')
                .setDescription('Nivel de dificultad')
                .setRequired(false)
                .addChoices(
                    { name: 'Fácil', value: 'fácil' },
                    { name: 'Media', value: 'media' },
                    { name: 'Difícil', value: 'difícil' },
                    { name: 'Experto', value: 'experto' }
                )
        ),
    
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const categories = Object.keys(CATEGORIES || {});
        
        const filtered = categories.filter(category => 
            category.toLowerCase().includes(focusedValue)
        ).slice(0, 25);
        
        await interaction.respond(
            filtered.map(category => ({ name: category, value: category }))
        );
    },
    
    async execute(interaction) {
        const categoria = interaction.options.getString('categoria');
        const dificultad = interaction.options.getString('dificultad');
        
        // Obtener pregunta aleatoria con los filtros
        const pregunta = await quizManager.getRandomQuestion(categoria, dificultad);
        
        // Si no hay preguntas que cumplan los filtros
        if (!pregunta) {
            return interaction.reply({
                content: "No hay preguntas disponibles con esos filtros. ¡Intenta con otras opciones!",
                ephemeral: true
            });
        }
        
        // Crear un embed más atractivo para la pregunta
        const embed = new EmbedBuilder()
            .setColor(COLORS.PRIMARY)
            .setTitle(`⏱️ ¡QUIZ VALORANT - 60 SEGUNDOS PARA RESPONDER!`)
            .setDescription(`### ${pregunta.pregunta}`)
            .setFooter({ 
                text: `Dificultad: ${pregunta.dificultad} • Categoría: ${pregunta.categoria}` 
            });
        
        if (pregunta.imagen) {
            embed.setImage(pregunta.imagen);
        } else {
            // Imagen por defecto para preguntas sin imagen
            embed.setThumbnail('https://media.valorant-api.com/sprays/af3a4d21-4272-e554-d356-1c97d8092200/displayicon.png');
        }
        
        // Añadir las opciones dentro del embed
        const opcionesText = pregunta.opciones.map((opcion, index) => 
            `**Opción ${index + 1}**: ${opcion}`
        ).join('\n\n');
        
        embed.addFields({ name: 'Opciones', value: opcionesText });
        
        // Crear botones sin emojis, solo con el texto de la opción
        const row = new ActionRowBuilder();
        
        pregunta.opciones.forEach((opcion, index) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`quiz_${pregunta.id}_${index}`)
                    .setLabel(`${opcion.length > 30 ? opcion.substring(0, 27) + '...' : opcion}`)
                    .setStyle(ButtonStyle.Primary)
            );
        });
        
        // Enviar pregunta con botones mejorados (solo visible para quien ejecutó el comando)
        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true // Hace que solo sea visible para quien ejecutó el comando
        });
        
        // Configurar el collector para respuestas
        await this.setupResponseCollector(interaction, pregunta, embed, row);
    },
    
    async setupResponseCollector(interaction, question, embed, row) {
        const filter = i => i.customId.startsWith(`quiz_${question.id}`) && i.user.id === interaction.user.id;
        
        try {
            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                time: ANSWER_TIMEOUT
            });
            
            collector.on('collect', async i => {
                // Obtener el índice seleccionado
                const selectedIndex = parseInt(i.customId.split('_')[2]);
                
                // Actualizar botones según la respuesta
                this.updateButtons(row, question.respuestaCorrecta, selectedIndex);
                
                // Procesar la respuesta
                const result = await quizManager.processAnswer(
                    interaction.user.id,
                    question,
                    selectedIndex
                );
                
                // Actualizar embed con resultado más atractivo
                if (result.isCorrect) {
                    embed.setColor(COLORS.SUCCESS);
                    embed.addFields({ 
                        name: '✅ ¡CORRECTO!', 
                        value: `Has ganado **${result.points} puntos**.\nPuntuación total: **${result.totalScore}**` 
                    });
                } else {
                    embed.setColor(COLORS.ERROR);
                    embed.addFields({ 
                        name: '❌ INCORRECTO', 
                        value: `La respuesta correcta era: **${result.correctAnswer}**\nSigue intentándolo.` 
                    });
                }
                
                await i.update({ embeds: [embed], components: [row] });
                collector.stop();
            });
            
            collector.on('end', async collected => {
                if (collected.size === 0) {
                    // Si el usuario no respondió a tiempo
                    this.updateButtons(row, question.respuestaCorrecta);
                    
                    // Actualizar embed para timeout con mejor diseño
                    embed.setColor(COLORS.WARNING);
                    embed.addFields({ 
                        name: '⏱️ ¡TIEMPO AGOTADO!', 
                        value: `La respuesta correcta era: **${question.opciones[question.respuestaCorrecta]}**` 
                    });
                    
                    await interaction.editReply({ 
                        embeds: [embed], 
                        components: [row],
                        ephemeral: true
                    });
                }
            });
        } catch (error) {
            console.error('Error en el collector:', error);
        }
    },
    
    updateButtons(row, correctIndex, selectedIndex = null) {
        row.components.forEach(button => {
            // Deshabilitar todos los botones
            button.setDisabled(true);
            
            // Obtener el índice del botón
            const buttonIndex = parseInt(button.data.custom_id.split('_')[2]);
            
            // Cambiar estilo según el resultado
            if (buttonIndex === correctIndex) {
                button.setStyle(ButtonStyle.Success);
                button.setLabel(`✓ ${button.data.label}`);
            } else if (selectedIndex !== null && buttonIndex === selectedIndex) {
                button.setStyle(ButtonStyle.Danger);
                button.setLabel(`✗ ${button.data.label}`);
            }
        });
    }
};