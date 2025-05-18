// src/services/ScoreService.js
const fs = require('fs').promises;
const path = require('path');
const { readJsonFile, writeJsonFile, fileExists } = require('../utils/fileOperations');

class ScoreService {
    constructor() {
        this.scoresPath = path.join(__dirname, '../../data/quizPoints.json');
    }
    
    /**
     * Obtiene todas las puntuaciones
     * @returns {Promise<Object>} Objeto con las puntuaciones
     */
    async getAllScores() {
        return await readJsonFile(this.scoresPath, {});
    }
    
    /**
     * Obtiene la puntuación de un usuario específico
     * @param {string} userId - ID del usuario
     * @returns {Promise<number>} Puntuación del usuario
     */
    async getUserScore(userId) {
        const scores = await this.getAllScores();
        return scores[userId] || 0;
    }
    
    /**
     * Actualiza la puntuación de un usuario
     * @param {string} userId - ID del usuario
     * @param {number} points - Puntos a añadir
     * @returns {Promise<number>} Puntuación total después de actualizar
     */
    async updateScore(userId, points) {
        const scores = await this.getAllScores();
        
        if (!scores[userId]) {
            scores[userId] = points;
        } else {
            scores[userId] += points;
        }
        
        await writeJsonFile(this.scoresPath, scores);
        return scores[userId];
    }
    
    /**
     * Obtiene el ranking de puntuaciones
     * @param {number} limit - Límite de usuarios a mostrar
     * @returns {Promise<Array>} Array ordenado de puntuaciones
     */
    async getRanking(limit = 10) {
        const scores = await this.getAllScores();
        
        return Object.entries(scores)
            .map(([userId, points]) => ({ userId, points }))
            .sort((a, b) => b.points - a.points)
            .slice(0, limit);
    }
}

module.exports = new ScoreService();