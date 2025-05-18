// src/models/AgentManager.js
const path = require('path');
const { readJsonFile } = require('../utils/fileOperations');

class AgentManager {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data/agentsData.json');
        this.agents = null;
        this.loadAgents();
    }
    
    async loadAgents() {
        try {
            const data = await readJsonFile(this.dataPath);
            this.agents = data.agents || {};
            console.log('✅ Datos de agentes cargados correctamente');
        } catch (error) {
            console.error('❌ Error al cargar datos de agentes:', error);
            this.agents = {};
        }
    }
    
    async getAllAgentNames() {
        if (!this.agents) {
            await this.loadAgents();
        }
        return Object.values(this.agents).map(agent => agent.name);
    }
    
    async getAgentByName(name) {
        if (!this.agents) {
            await this.loadAgents();
        }
        
        // Buscar por nombre exacto
        const exactMatch = Object.values(this.agents).find(
            agent => agent.name.toLowerCase() === name.toLowerCase()
        );
        if (exactMatch) return exactMatch;
        
        // Buscar por nombre parcial
        return Object.values(this.agents).find(
            agent => agent.name.toLowerCase().includes(name.toLowerCase())
        );
    }
    
    async reloadData() {
        await this.loadAgents();
        return !!this.agents;
    }
}

module.exports = new AgentManager();