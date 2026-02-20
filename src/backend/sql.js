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

    _db.serialize(() => {
        _db.all("PRAGMA table_info('users')", (err, cols) => {
            if (err) return;
            const names = (cols || []).map(c => c.name);
            if (!names.includes('participate')) {
                _db.run("ALTER TABLE users ADD COLUMN participate INTEGER DEFAULT 1");
            }
            if (!names.includes('pinged')) {
                _db.run("ALTER TABLE users ADD COLUMN pinged INTEGER DEFAULT 1");
            }
        });
    });
}

function getDB() {
    return _db;
}

module.exports = {
    initDB,
    getDB
};