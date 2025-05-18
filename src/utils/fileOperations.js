// src/utils/fileOperations.js
const fs = require('fs').promises;
const path = require('path');

/**
 * Lee un archivo JSON
 * @param {string} filePath - Ruta del archivo
 * @param {Object} defaultValue - Valor por defecto si el archivo no existe
 * @returns {Promise<Object>} Contenido del archivo JSON
 */
async function readJsonFile(filePath, defaultValue = {}) {
    try {
        const exists = await fileExists(filePath);
        if (!exists) {
            return defaultValue;
        }
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al leer el archivo JSON:', error);
        return defaultValue;
    }
}

/**
 * Escribe un objeto en un archivo JSON
 * @param {string} filePath - Ruta del archivo
 * @param {Object} data - Datos a escribir
 * @param {boolean} prettyPrint - Si se debe formatear el JSON
 * @returns {Promise<void>}
 */
async function writeJsonFile(filePath, data, prettyPrint = true) {
    try {
        await fs.writeFile(
            filePath,
            JSON.stringify(data, null, prettyPrint ? 2 : 0),
            'utf8'
        );
    } catch (error) {
        console.error('Error al escribir el archivo JSON:', error);
    }
}

/**
 * Verifica si un archivo existe
 * @param {string} filePath - Ruta del archivo
 * @returns {Promise<boolean>}
 */
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

module.exports = {
    readJsonFile,
    writeJsonFile,
    fileExists
};