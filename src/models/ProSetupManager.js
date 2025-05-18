// src/models/ProSetupManager.js
const fs = require('fs').promises;
const path = require('path');

class ProSetupManager {
    constructor() {
        this.proPlayersData = {};
        this.filePath = path.join(process.cwd(), 'data', 'proSetupData.json');
        this.loaded = false;
    }
    
    async init() {
        if (this.loaded) return;
        
        try {
            // Intentar cargar datos existentes
            const data = await fs.readFile(this.filePath, 'utf8');
            this.proPlayersData = JSON.parse(data);
            this.loaded = true;
        } catch (error) {
            // Si el archivo no existe o hay error, crear datos iniciales
            console.log('Creando archivo de datos para ProSetup...');
            await this.createDefaultData();
            this.loaded = true;
        }
    }
    
    async createDefaultData() {
        const defaultData = {
            "TenZ": {
                team: "Sentinels",
                role: "Duelista",
                mouse: "Logitech G Pro X Superlight 2",
                dpi: 800,
                sensitivity: 0.345,
                polling_rate: 1000,
                keyboard: "Xtrfy K5 Compact RGB",
                switches: "Gateron Red",
                headset: "HyperX Cloud Alpha",
                resolution: "1920x1080",
                aspect_ratio: "16:9",
                fps_cap: "Unlimited",
                multithreaded_rendering: true,
                crosshair_code: "0;P;c;1;h;0;f;0;0l;3;0o;2;0a;1;0f;0;1t;0;1l;0;1o;0;1a;0;1m;0;1f;0",
                crosshair_color: "Blanco",
                crosshair_outline: false,
                crosshair_image: "https://media.valorant-api.com/crosshairs/0;P;c;1;h;0;f;0;0l;3;0o;2;0a;1;0f;0;1t;0;1l;0;1o;0;1a;0;1m;0;1f;0/crosshair.png",
                main_agents: ["Jett", "Raze", "Reyna"],
                fun_fact: "Conocido por sus clips virales y su estilo de juego agresivo",
                image: "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png",
                last_updated: "Mayo 2025"
            },
            "ScreaM": {
                team: "Team Liquid",
                role: "Duelista",
                mouse: "Endgame Gear XM1r",
                dpi: 400,
                sensitivity: 0.72,
                polling_rate: 1000,
                keyboard: "Xtrfy K4 TKL",
                switches: "Kailh Red",
                headset: "Logitech G Pro X",
                resolution: "1920x1080",
                aspect_ratio: "16:9",
                fps_cap: "240",
                multithreaded_rendering: true,
                crosshair_code: "0;s;1;P;c;5;h;0;f;0;0l;4;0o;2;0a;1;0f;0;1b;0",
                crosshair_color: "Cyan",
                crosshair_outline: false,
                crosshair_image: "https://media.valorant-api.com/crosshairs/0;s;1;P;c;5;h;0;f;0;0l;4;0o;2;0a;1;0f;0;1b;0/crosshair.png",
                main_agents: ["Phoenix", "Reyna", "KAY/O"],
                fun_fact: "Conocido como 'The Headshot Machine' desde sus días en CS:GO",
                image: "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png",
                last_updated: "Mayo 2025"
            }
        };
        
        // Guardar datos por defecto
        await this.saveData(defaultData);
        this.proPlayersData = defaultData;
    }
    
    async saveData(data = null) {
        const dataToSave = data || this.proPlayersData;
        try {
            // Asegurarse de que el directorio existe
            const dirPath = path.dirname(this.filePath);
            await fs.mkdir(dirPath, { recursive: true });
            
            // Guardar datos
            await fs.writeFile(this.filePath, JSON.stringify(dataToSave, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error('Error al guardar datos de ProSetup:', error);
            return false;
        }
    }
    
    async getAllPlayers() {
        await this.init();
        return this.proPlayersData;
    }
    
    async getPlayer(playerName) {
        await this.init();
        return this.proPlayersData[playerName];
    }
    
    async getPlayersByTeam(teamName) {
        await this.init();
        
        const teamPlayers = {};
        for (const [name, data] of Object.entries(this.proPlayersData)) {
            if (data.team.toLowerCase() === teamName.toLowerCase()) {
                teamPlayers[name] = data;
            }
        }
        
        return teamPlayers;
    }
    
    async getPlayersByRole(role) {
        await this.init();
        
        const rolePlayers = {};
        for (const [name, data] of Object.entries(this.proPlayersData)) {
            if (data.role.toLowerCase() === role.toLowerCase()) {
                rolePlayers[name] = data;
            }
        }
        
        return rolePlayers;
    }
    
    async getPopularPlayers(limit = 10) {
        await this.init();
        
        // Aquí podrías implementar alguna lógica para determinar popularidad
        // Por ahora, simplemente devolvemos los primeros N jugadores
        const popularPlayers = {};
        const playerNames = Object.keys(this.proPlayersData).slice(0, limit);
        
        for (const name of playerNames) {
            popularPlayers[name] = this.proPlayersData[name];
        }
        
        return popularPlayers;
    }
    
    async addPlayer(playerName, playerData) {
        await this.init();
        
        this.proPlayersData[playerName] = playerData;
        return this.saveData();
    }
    
    async updatePlayer(playerName, playerData) {
        await this.init();
        
        if (!this.proPlayersData[playerName]) {
            return false;
        }
        
        this.proPlayersData[playerName] = {
            ...this.proPlayersData[playerName],
            ...playerData
        };
        
        return this.saveData();
    }
    
    async deletePlayer(playerName) {
        await this.init();
        
        if (!this.proPlayersData[playerName]) {
            return false;
        }
        
        delete this.proPlayersData[playerName];
        return this.saveData();
    }
}

module.exports = new ProSetupManager();