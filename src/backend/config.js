const fs = require('fs');

let configPath = 'config.json';
let cachedConfig = null;

function initConfig(customPath) {
    if (customPath) {
        if (!fs.existsSync(customPath)) {
            console.error(`Config file ${customPath} not found!`);
            process.exit(1);
        }
        configPath = customPath;
    } else {
        if (!fs.existsSync(configPath)) {
            console.error('Config file not found!');
            process.exit(1);
        }
    }
    
    try {
        const configData = fs.readFileSync(configPath);
        cachedConfig = JSON.parse(configData);
    } catch (err) {
        console.error('Failed to read or parse config:', err.message);
        process.exit(1);
    }
}

function getKey(key) {
    if (!cachedConfig) {
        initConfig();
    }
    return cachedConfig[key] ?? null;
}

function getAllConfig() {
    if (!cachedConfig) {
        initConfig();
    }
    return cachedConfig;
}

function reloadConfig() {
    try {
        const configData = fs.readFileSync(configPath);
        cachedConfig = JSON.parse(configData);
        return cachedConfig;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    initConfig,
    getKey,
    getAllConfig,
    reloadConfig
};