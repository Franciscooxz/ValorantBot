// src/commands/quizrank.js (versión simplificada sin tabla)
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { COLORS } = require('../config/colors');
const scoreService = require('../services/ScoreService');
const { MAX_RANKING_PLAYERS } = require('../config/quizConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quizrank')
        .setDescription('Muestra el ranking del quiz de VALORANT'),
    
    async execute(interaction) {
        // Obtener las puntuaciones y posiciones
        const ranking = await scoreService.getRanking(MAX_RANKING_PLAYERS);
        
        // Si no hay puntuaciones
        if (ranking.length === 0) {
            const emptyEmbed = new EmbedBuilder()
                .setColor(COLORS.WARNING)
                .setTitle('📊 Ranking de Quiz VALORANT')
                .setDescription('🏆 **¡El ranking está vacío!** 🏆\n\nSé el primero en jugar al quiz con `/quiz` y aparecer en el ranking.\n\n¡Demuestra tus conocimientos sobre VALORANT y conquista el primer puesto!')
                .setThumbnail('https://media.valorant-api.com/sprays/0cb0626c-4d34-db73-93e9-19a19a1762ca/displayicon.png')
                .setFooter({ text: 'VALORANT Quiz | Usa /quiz para empezar a jugar' });
            
            return interaction.reply({
                embeds: [emptyEmbed]
            });
        }
        
        // Obtener datos del usuario actual
        const userData = await this.getUserRankingData(interaction.user.id, ranking);
        
        // Crear un embed para el ranking
        const embed = new EmbedBuilder()
            .setColor(COLORS.PRIMARY)
            .setTitle('🏆 Ranking de VALORANT Quiz')
            .setDescription('Los mejores jugadores del Quiz de VALORANT')
            .setThumbnail('https://media.valorant-api.com/sprays/af3a4d21-4272-e554-d356-1c97d8092200/displayicon.png')
            .setFooter({ 
                text: `Tu puntuación: ${userData.points || 0} pts | Tu posición: #${userData.position || 'N/A'}` 
            });
        
        // Crear sección para el podio (Top 3)
        if (ranking.length >= 1) {
            // Separar el top 3 con un estilo más destacado
            let podiumText = '';
            
            // Primer lugar - Campeón
            if (ranking.length >= 1) {
                podiumText += `🥇 **Campeón**\n`;
                podiumText += `┃ <@${ranking[0].userId}>\n`;
                podiumText += `┃ Puntuación: **${ranking[0].points}** pts\n\n`;
            }
            
            // Segundo lugar
            if (ranking.length >= 2) {
                podiumText += `🥈 **Subcampeón**\n`;
                podiumText += `┃ <@${ranking[1].userId}>\n`;
                podiumText += `┃ Puntuación: **${ranking[1].points}** pts\n\n`;
            }
            
            // Tercer lugar
            if (ranking.length >= 3) {
                podiumText += `🥉 **Tercer Puesto**\n`;
                podiumText += `┃ <@${ranking[2].userId}>\n`;
                podiumText += `┃ Puntuación: **${ranking[2].points}** pts\n`;
            }
            
            if (podiumText) {
                embed.addFields({ 
                    name: '━━━ PODIO DE HONOR ━━━', 
                    value: podiumText 
                });
            }
            
            // Mostrar el resto de jugadores (del 4 en adelante) en formato sencillo
            if (ranking.length > 3) {
                let restText = '';
                
                for (let i = 3; i < ranking.length; i++) {
                    restText += `**${i + 1}.** <@${ranking[i].userId}> - **${ranking[i].points}** pts\n`;
                }
                
                embed.addFields({ 
                    name: '━━━ CLASIFICACIÓN ━━━', 
                    value: restText 
                });
            }
        }
        
        // Añadir posición del usuario actual si no está en el top 10
        if (userData && userData.position > ranking.length) {
            embed.addFields({ 
                name: '📍 Tu Posición en el Ranking', 
                value: `Estás en la posición **#${userData.position}** con **${userData.points}** puntos.\n¡Sigue jugando para subir en la clasificación!` 
            });
        }
        
        // Añadir información sobre cómo mejorar en el ranking
        embed.addFields({ 
            name: '🎮 ¿Cómo mejorar tu ranking?', 
            value: '• Usa `/quiz` para responder preguntas y ganar puntos\n• Las preguntas difíciles otorgan más puntos\n• Responde correctamente de manera consecutiva para acumular más puntos\n• Desafía tus conocimientos con diferentes categorías' 
        });
        
        await interaction.reply({
            embeds: [embed]
        });
    },
    
    async getUserRankingData(userId, rankingData) {
        // Buscar al usuario en el ranking actual
        const userInRanking = rankingData.find(entry => entry.userId === userId);
        
        // Si está en el ranking actual, devolver sus datos
        if (userInRanking) {
            return {
                points: userInRanking.points,
                position: rankingData.findIndex(entry => entry.userId === userId) + 1
            };
        }
        
        // Si no está en el ranking actual, buscar su puntuación
        const userScore = await scoreService.getUserScore(userId);
        
        if (userScore > 0) {
            // Obtener todos los scores para calcular su posición
            const allScores = await scoreService.getAllScores();
            const sortedScores = Object.entries(allScores)
                .map(([id, points]) => ({ userId: id, points }))
                .sort((a, b) => b.points - a.points);
            
            const position = sortedScores.findIndex(entry => entry.userId === userId) + 1;
            
            return {
                points: userScore,
                position: position
            };
        }
        
        // Si no tiene puntuación
        return {
            points: 0,
            position: 'N/A'
        };
    }
};