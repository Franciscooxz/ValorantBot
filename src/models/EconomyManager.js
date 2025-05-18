// src/models/EconomyManager.js
const path = require('path');
const { readJsonFile } = require('../utils/fileOperations');

class EconomyManager {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data/economyData.json');
        this.economyData = null;
        this.loadEconomyData();
    }
    
    async loadEconomyData() {
        try {
            const data = await readJsonFile(this.dataPath);
            this.economyData = data || this.getDefaultEconomyData();
            console.log('✅ Datos de economía cargados correctamente');
        } catch (error) {
            console.error('❌ Error al cargar datos de economía:', error);
            this.economyData = this.getDefaultEconomyData();
        }
    }
    
    getDefaultEconomyData() {
        // Datos predeterminados si no existe el archivo o hay error
        return {
            armasPorPrecio: {
                gratis: ["Classic"],
                barato: ["Shorty (150)", "Frenzy (450)", "Ghost (500)", "Sheriff (800)", "Stinger (950)", "Marshal (950)", "Bucky (850)"],
                medio: ["Spectre (1600)", "Bulldog (2050)", "Guardian (2250)", "Ares (1600)", "Judge (1850)"],
                caro: ["Phantom (2900)", "Vandal (2900)", "Operator (4700)", "Odin (3200)"]
            },
            escudos: [
                { nombre: "Escudo Ligero", precio: 400, protección: 25 },
                { nombre: "Escudo Completo", precio: 1000, protección: 50 }
            ],
            creditosPorRonda: [
                { tipo: "Victoria", cantidad: 3000, notas: "Cantidad fija para todo el equipo" },
                { tipo: "Derrota (1ª)", cantidad: 1900, notas: "Primera derrota" },
                { tipo: "Derrota (2ª)", cantidad: 2400, notas: "Segunda derrota consecutiva" },
                { tipo: "Derrota (3ª+)", cantidad: 2900, notas: "Tercera derrota consecutiva o más" },
                { tipo: "Eliminación", cantidad: 200, notas: "Por cada eliminación conseguida" },
                { tipo: "Plantar Spike", cantidad: 300, notas: "Solo para quien planta" }
            ],
            tiposDeRondas: [
                { nombre: "Pistola", descripción: "Primera ronda de cada mitad (todos tienen 800 créditos)" },
                { nombre: "Eco", descripción: "Mínimo gasto para ahorrar para rondas futuras" },
                { nombre: "Semi-Buy", descripción: "Inversión moderada con pistolas mejoradas o SMGs" },
                { nombre: "Force-Buy", descripción: "Gastar todos los créditos disponibles aunque no sea suficiente para full-buy" },
                { nombre: "Full-Buy", descripción: "Compra completa con rifles, escudos y habilidades" }
            ],
            consejos: [
                "Sincroniza tus compras con tu equipo - es mejor hacer eco o full-buy todos juntos",
                "El límite máximo de créditos es 9000 - si te acercas a este límite, considera comprar para tus compañeros",
                "Siempre intenta recuperar armas caídas (tuyas o del enemigo) al final de la ronda",
                "Algunos agentes como Jett o Reyna son buenos 'guardianes de armas' que pueden escapar tras conseguir kills",
                "Si tienes dudas sobre la economía enemiga, observa qué armas usaron en rondas anteriores",
                "Aprender a usar efectivamente armas económicas (Sheriff, Spectre, Marshal) es clave para rondas eco",
                "A veces es mejor hacer eco completo que un semi-buy, para garantizar un full-buy en la siguiente ronda"
            ],
            loadouts: {
                "800 (Pistola)": [
                    { nombre: "Clásico", descripción: "Classic (Gratis) + Escudo Ligero (400) + Habilidades (400)" },
                    { nombre: "Ghost", descripción: "Ghost (500) + Habilidades (300)" },
                    { nombre: "Sheriff", descripción: "Sheriff (800) + Ninguna habilidad" }
                ],
                "≤2000 (Eco)": [
                    { nombre: "Ahorro Máximo", descripción: "Classic (Gratis) + Mínimo de habilidades + Guardar resto" },
                    { nombre: "Eco con Potencial", descripción: "Sheriff (800) + Habilidades básicas (400)" },
                    { nombre: "Light Eco", descripción: "Stinger/Shorty + Escudo Ligero (400) + Habilidades básicas" }
                ],
                "2000-3500 (Semi-Buy)": [
                    { nombre: "Económico", descripción: "Spectre (1600) + Escudo Ligero (400) + Habilidades básicas" },
                    { nombre: "Opción Rifle", descripción: "Bulldog (2050) + Escudo Ligero (400) + Habilidades básicas" },
                    { nombre: "Franco Económico", descripción: "Marshal (950) + Escudo Ligero (400) + Habilidades completas" }
                ],
                "4000+ (Full-Buy)": [
                    { nombre: "Estándar", descripción: "Phantom/Vandal (2900) + Escudo Completo (1000) + Habilidades completas" },
                    { nombre: "Franco Pesado", descripción: "Operator (4700) + Habilidades mínimas + Escudo si posible" },
                    { nombre: "Apoyo", descripción: "Phantom/Vandal + Escudo Completo + Todas las habilidades + Extras para equipo" }
                ]
            }
        };
    }
    
    async getWeaponsByPrice() {
        if (!this.economyData) {
            await this.loadEconomyData();
        }
        return this.economyData.armasPorPrecio || {};
    }
    
    async getShieldInfo() {
        if (!this.economyData) {
            await this.loadEconomyData();
        }
        return this.economyData.escudos || [];
    }
    
    async getCreditsPerRound() {
        if (!this.economyData) {
            await this.loadEconomyData();
        }
        return this.economyData.creditosPorRonda || [];
    }
    
    async getRoundTypes() {
        if (!this.economyData) {
            await this.loadEconomyData();
        }
        return this.economyData.tiposDeRondas || [];
    }
    
    async getTips() {
        if (!this.economyData) {
            await this.loadEconomyData();
        }
        return this.economyData.consejos || [];
    }
    
    async getLoadoutSuggestions() {
        if (!this.economyData) {
            await this.loadEconomyData();
        }
        return this.economyData.loadouts || {};
    }
    
    async reloadData() {
        await this.loadEconomyData();
        return !!this.economyData;
    }
}

module.exports = new EconomyManager();