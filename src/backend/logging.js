const { Worker } = require('worker_threads');
const path = require('path');
const util = require('util');

const COLORS = {
    reset: '\x1b[0m',
    gray: '\x1b[90m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    cyan: '\x1b[36m'
};

class Logger {
    constructor(logFile) {
        this.worker = new Worker(path.join(__dirname, 'logger.worker.js'), {
            workerData: { logFile }
        });

        this.worker.on('error', err => {
            console.error('Logger worker error:', err);
        });

        process.on('exit', () => {
            this.worker.postMessage({ type: 'shutdown' });
        });
    }

    format(level, args) {
        const timestamp = new Date().toISOString();
        const message = args.map(a =>
            typeof a === 'string'
                ? a
                : util.inspect(a, { depth: null, colors: false })
        ).join(' ');

        return { timestamp, level, message };
    }

    write(level, color, ...args) {
        const entry = this.format(level, args);

        this.worker.postMessage(entry);

        const levelTag = `[${level}]`.padEnd(7);
        console.log(
            `${COLORS.gray}${entry.timestamp}${COLORS.reset} ` +
            `${color}${levelTag}${COLORS.reset} ` +
            `${entry.message}`
        );
    }

    info(...args) {
        this.write('INFO', COLORS.green, ...args);
    }

    warn(...args) {
        this.write('WARN', COLORS.yellow, ...args);
    }

    error(...args) {
        this.write('ERROR', COLORS.red, ...args);
    }

    debug(...args) {
        this.write('DEBUG', COLORS.cyan, ...args);
    }
}

module.exports = Logger;