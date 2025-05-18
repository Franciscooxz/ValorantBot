// src/models/MapManager.js
const path = require('path');
const { readJsonFile } = require('../utils/fileOperations');

class MapManager {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data/mapsData.json');
        this.maps = null;
        this.loadMaps();
    }
    
    async loadMaps() {
        try {
            const data = await readJsonFile(this.dataPath);
            this.maps = data.maps || {};
            console.log('✅ Datos de mapas cargados correctamente');
        } catch (error) {
            console.error('❌ Error al cargar datos de mapas:', error);
            this.maps = {};
        }
    }
    
    async getAllMapNames() {
        if (!this.maps) {
            await this.loadMaps();
        }
        return Object.values(this.maps).map(map => map.name);
    }
    
    async getMapByName(name) {
        if (!this.maps) {
            await this.loadMaps();
        }
        
        // Buscar por nombre exacto
        const exactMatch = Object.values(this.maps).find(
            map => map.name.toLowerCase() === name.toLowerCase()
        );
        if (exactMatch) return exactMatch;
        
        // Buscar por nombre parcial
        return Object.values(this.maps).find(
            map => map.name.toLowerCase().includes(name.toLowerCase())
        );
    }
    
    async reloadData() {
        await this.loadMaps();
        return !!this.maps;
    }
}

module.exports = new MapManager();