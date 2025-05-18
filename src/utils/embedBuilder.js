// src/utils/embedBuilder.js
const { EmbedBuilder } = require('discord.js');
const { COLORS } = require('../config/colors');

/**
 * Crea un embed base con opciones personalizadas
 * @param {Object} options - Opciones de personalización
 * @returns {EmbedBuilder} Embed configurado
 */
function createBaseEmbed(options = {}) {
    const embed = new EmbedBuilder()
        .setColor(options.color || COLORS.PRIMARY)
        .setTitle(options.title || '')
        .setDescription(options.description || '');
    
    // Añadir thumbnail si existe
    if (options.thumbnail) {
        embed.setThumbnail(options.thumbnail);
    }
    
    // Añadir imagen si existe
    if (options.image) {
        embed.setImage(options.image);
    }
    
    // Añadir footer si existe
    if (options.footer) {
        embed.setFooter({
            text: options.footer.text || 'VALORANT Bot',
            iconURL: options.footer.iconURL || null
        });
    }
    
    // Añadir timestamp solo si se especifica explícitamente
    if (options.timestamp === true) {
        embed.setTimestamp(); // Sin parámetros para usar la hora actual
    } else if (options.timestamp instanceof Date) {
        embed.setTimestamp(options.timestamp); // Con fecha específica
    }
    
    return embed;
}

/**
 * Crea un embed para una pregunta de quiz
 * @param {Object} question - Pregunta completa
 * @returns {EmbedBuilder} Embed con la pregunta
 */
function createQuizQuestionEmbed(question) {
    const embed = createBaseEmbed({
        title: `Quiz de VALORANT: ${question.categoria}`,
        description: `**${question.pregunta}**\n\n${formatOptions(question.opciones)}`,
        color: COLORS.PRIMARY,
        footer: {
            text: `Dificultad: ${question.dificultad} • Responde usando los botones`
        },
        // No poner timestamp aquí
    });
    
    if (question.imagen) {
        embed.setImage(question.imagen);
    }
    
    return embed;
}

/**
 * Actualiza un embed con el resultado de la respuesta
 * @param {EmbedBuilder} embed - Embed original
 * @param {Object} result - Resultado de la respuesta
 * @returns {EmbedBuilder} Embed actualizado
 */
function updateQuizResultEmbed(embed, result) {
    const resultText = result.isCorrect 
        ? `✅ **¡Correcto!** Has ganado ${result.points} puntos. Puntuación total: ${result.totalScore}`
        : `❌ **Incorrecto.** La respuesta correcta era: ${result.correctAnswer}`;
    
    embed.setDescription(embed.data.description + '\n\n' + resultText);
    embed.setColor(result.isCorrect ? COLORS.SUCCESS : COLORS.ERROR);
    
    return embed;
}

/**
 * Crea un embed para timeout de pregunta
 * @param {EmbedBuilder} embed - Embed original
 * @param {string} correctAnswer - Respuesta correcta
 * @returns {EmbedBuilder} Embed actualizado
 */
function createTimeoutEmbed(embed, correctAnswer) {
    embed.setDescription(embed.data.description + '\n\n⏱️ **¡Tiempo agotado!** La respuesta correcta era: ' + correctAnswer);
    embed.setColor(COLORS.WARNING);
    return embed;
}

/**
 * Crea un embed para mostrar el ranking
 * @param {Array} rankingData - Datos del ranking
 * @param {Object} userData - Datos del usuario que solicitó el ranking
 * @returns {EmbedBuilder} Embed con el ranking
 */
function createRankingEmbed(rankingData, userData) {
    let description = '';
    
    rankingData.forEach((entry, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        description += `${medal} <@${entry.userId}> - **${entry.points}** puntos\n`;
    });
    
    if (description === '') {
        description = 'No hay datos de ranking disponibles aún. ¡Sé el primero en jugar al quiz!';
    }
    
    const embed = createBaseEmbed({
        title: '🏆 Ranking del Quiz de VALORANT',
        description: description,
        color: COLORS.PRIMARY,
        // No poner timestamp aquí
    });
    
    if (userData) {
        embed.setFooter({
            text: `Tu puntuación: ${userData.points || 0} puntos - Posición: ${userData.position || 'N/A'}`
        });
    }
    
    return embed;
}

/**
 * Formatea las opciones para mostrarlas en un embed
 * @param {Array} options - Array de opciones
 * @returns {string} Opciones formateadas
 */
function formatOptions(options) {
    return options.map((option, index) => {
        return `${['🇦', '🇧', '🇨', '🇩'][index]} ${option}`;
    }).join('\n');
}

module.exports = {
    createBaseEmbed,
    createQuizQuestionEmbed,
    updateQuizResultEmbed,
    createTimeoutEmbed,
    createRankingEmbed
};