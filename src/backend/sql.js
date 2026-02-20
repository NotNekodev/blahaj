const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/levels.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            userid TEXT PRIMARY KEY,
            textxp INTEGER DEFAULT 0,
            voicexp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1
        )
    `);
});

module.exports = {
    db
}