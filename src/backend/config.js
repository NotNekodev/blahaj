const fs = require('fs');

let configPath = 'config.json';
let cachedConfig = null;

function attachSaveMethod(obj) {
    Object.defineProperty(obj, 'save', {
        value: function () {
            try {
                const data = JSON.stringify(this, null, 4);
                fs.writeFileSync(configPath, data);
            } catch (err) {
                console.error('Failed to save config:', err.message);
                throw err;
            }
        },
        enumerable: false
    });

    return obj;
}

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
        cachedConfig = attachSaveMethod(JSON.parse(configData));
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
        cachedConfig = attachSaveMethod(JSON.parse(configData));
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