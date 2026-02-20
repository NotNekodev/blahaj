let sqlite3;
let _db = null;

function initDB(dbPath) {
    sqlite3 = require('sqlite3').verbose();
    _db = new sqlite3.Database(dbPath || './levels.db');

    _db.serialize(() => {
        _db.run(`
            CREATE TABLE IF NOT EXISTS users (
                userid TEXT PRIMARY KEY,
                textxp INTEGER DEFAULT 0,
                voicexp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1
            )
        `);
    });
}

function getDB() {
    return _db;
}

module.exports = {
    initDB,
    getDB
};