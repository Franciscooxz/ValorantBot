// src/models/LoreManager.js
const path = require('path');
const { readJsonFile } = require('../utils/fileOperations');

class LoreManager {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data/loreData.json');
        this.loreData = null;
        this.loadLoreData();
    }
    
    async loadLoreData() {
        try {
            const data = await readJsonFile(this.dataPath);
            this.loreData = data || {};
            console.log('✅ Datos de lore cargados correctamente');
        } catch (error) {
            console.error('❌ Error al cargar datos de lore:', error);
            this.loreData = {};
        }
    }
    
    async getMainLore() {
        if (!this.loreData) {
            await this.loadLoreData();
        }
        return this.loreData.mainLore || {};
    }
    
    async getAgentLore(agentName) {
        if (!this.loreData) {
            await this.loadLoreData();
        }
        
        if (!this.loreData.agentesLore) return null;
        
        // Buscar por nombre exacto
        const exactMatch = this.loreData.agentesLore.find(
            agent => agent.nombre.toLowerCase() === agentName.toLowerCase()
        );
        if (exactMatch) return exactMatch;
        
        // Buscar por nombre parcial
        return this.loreData.agentesLore.find(
            agent => agent.nombre.toLowerCase().includes(agentName.toLowerCase())
        );
    }
    
    async getAllAgentsLore() {
        if (!this.loreData) {
            await this.loadLoreData();
        }
        return this.loreData.agentesLore || [];
    }
    
    async getTimelineEvents() {
        if (!this.loreData) {
            await this.loadLoreData();
        }
        return this.loreData.timelineEvents || [];
    }
    
    async getAgentRelationships(agentName) {
        if (!this.loreData) {
            await this.loadLoreData();
        }
        
        if (!this.loreData.relacionesAgentes) return [];
        
        return this.loreData.relacionesAgentes.filter(
            relation => relation.agentes.some(
                agent => agent.toLowerCase() === agentName.toLowerCase()
            )
        );
    }
    
    async getAllRelationships() {
        if (!this.loreData) {
            await this.loadLoreData();
        }
        return this.loreData.relacionesAgentes || [];
    }
    
    async reloadData() {
        await this.loadLoreData();
        return !!this.loreData;
    }
}

module.exports = new LoreManager();