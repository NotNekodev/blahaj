const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');

const logStream = fs.createWriteStream(workerData.logFile, { flags: 'a' });

parentPort.on('message', (data) => {
    if (data.type === 'shutdown') {
        logStream.end();
        process.exit(0);
    }

    const { timestamp, level, message } = data;
    logStream.write(`[${timestamp}] [${level}] ${message}\n`);
});