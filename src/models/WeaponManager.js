// src/models/WeaponManager.js
const path = require('path');
const { readJsonFile } = require('../utils/fileOperations');

class WeaponManager {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data/weaponsData.json');
        this.weapons = null;
        this.loadWeapons();
    }
    
    async loadWeapons() {
        try {
            const data = await readJsonFile(this.dataPath);
            this.weapons = data.weapons || {};
            console.log('✅ Datos de armas cargados correctamente');
        } catch (error) {
            console.error('❌ Error al cargar datos de armas:', error);
            this.weapons = {};
        }
    }
    
    async getAllWeaponNames() {
        if (!this.weapons) {
            await this.loadWeapons();
        }
        return Object.values(this.weapons).map(weapon => weapon.name);
    }
    
    async getWeaponByName(name) {
        if (!this.weapons) {
            await this.loadWeapons();
        }
        
        // Buscar por nombre exacto
        const exactMatch = Object.values(this.weapons).find(
            weapon => weapon.name.toLowerCase() === name.toLowerCase()
        );
        if (exactMatch) return exactMatch;
        
        // Buscar por nombre parcial
        return Object.values(this.weapons).find(
            weapon => weapon.name.toLowerCase().includes(name.toLowerCase())
        );
    }
    
    async reloadData() {
        await this.loadWeapons();
        return !!this.weapons;
    }
}

module.exports = new WeaponManager();