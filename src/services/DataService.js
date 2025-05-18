// src/services/DataService.js
const fs = require('fs').promises;
const path = require('path');

class DataService {
    constructor() {
        this.dataDir = path.join(__dirname, '../../data');
    }
    
    /**
     * Lee un archivo JSON del directorio de datos
     * @param {string} fileName - Nombre del archivo en la carpeta data
     * @param {object} defaultValue - Valor por defecto si el archivo no existe
     * @returns {Promise<object>} Los datos del archivo
     */
    async readDataFile(fileName, defaultValue = {}) {
        try {
            const filePath = path.join(this.dataDir, fileName);
            const exists = await this.fileExists(filePath);
            
            if (!exists) {
                return defaultValue;
            }
            
            const rawData = await fs.readFile(filePath, 'utf8');
            return JSON.parse(rawData);
        } catch (error) {
            console.error(`Error al leer archivo de datos (${fileName}):`, error);
            return defaultValue;
        }
    }
    
    /**
     * Escribe datos en un archivo JSON en el directorio de datos
     * @param {string} fileName - Nombre del archivo en la carpeta data
     * @param {object} data - Datos a escribir
     * @param {boolean} prettyPrint - Si se debe formatear el JSON
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async writeDataFile(fileName, data, prettyPrint = true) {
        try {
            if (!await this.directoryExists(this.dataDir)) {
                await fs.mkdir(this.dataDir, { recursive: true });
            }
            
            const filePath = path.join(this.dataDir, fileName);
            await fs.writeFile(
                filePath,
                JSON.stringify(data, null, prettyPrint ? 2 : 0),
                'utf8'
            );
            
            return true;
        } catch (error) {
            console.error(`Error al escribir archivo de datos (${fileName}):`, error);
            return false;
        }
    }
    
    /**
     * Verifica si un archivo existe
     * @param {string} filePath - Ruta completa del archivo
     * @returns {Promise<boolean>}
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * Verifica si un directorio existe
     * @param {string} dirPath - Ruta del directorio
     * @returns {Promise<boolean>}
     */
    async directoryExists(dirPath) {
        try {
            const stats = await fs.stat(dirPath);
            return stats.isDirectory();
        } catch {
            return false;
        }
    }
    
    /**
     * Crea el directorio de datos si no existe
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async ensureDataDirectory() {
        try {
            if (!await this.directoryExists(this.dataDir)) {
                await fs.mkdir(this.dataDir, { recursive: true });
                console.log(`✅ Directorio de datos creado en: ${this.dataDir}`);
            }
            return true;
        } catch (error) {
            console.error('❌ Error al crear directorio de datos:', error);
            return false;
        }
    }
}

module.exports = new DataService();