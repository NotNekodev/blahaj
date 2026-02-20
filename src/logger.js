const path = require('path');
const LoggerClass = require('./backend/logging');

let instance = null;

function configure(options = {}) {
    if (instance) return instance;
    const logFile = options.logFile || path.join(process.cwd(), 'blahaj.log');
    instance = new LoggerClass(logFile);
    return instance;
}

function getLogger() {
    if (!instance) configure();
    return instance;
}

module.exports = {
    configure,
    getLogger,
    info: (...args) => getLogger().info(...args),
    warn: (...args) => getLogger().warn(...args),
    error: (...args) => getLogger().error(...args),
    debug: (...args) => getLogger().debug(...args)
};
