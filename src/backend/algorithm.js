const sql = require('./sql');

function getDB() {
    return sql.getDB();
}

function calculateLevel(userid) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        if (!db) {
            resolve(1);
            return;
        }

        db.get('SELECT textxp, voicexp FROM users WHERE userid = ?', [userid], (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            if (!row) {
                resolve(1);
                return;
            }

            const totalXP = row.textxp + row.voicexp;
            const level = Math.floor(0.1 * Math.sqrt(totalXP));

            resolve(level);
        });
    });
}

function addTextXP(userid, amount) {
    const db = getDB();
    if (!db) return;
    db.run('INSERT INTO users (userid, textxp) VALUES (?, ?) ON CONFLICT(userid) DO UPDATE SET textxp = textxp + ?', [userid, amount, amount]);
}

function addVoiceXP(userid, amount) {
    const db = getDB();
    if (!db) return;
    db.run('INSERT INTO users (userid, voicexp) VALUES (?, ?) ON CONFLICT(userid) DO UPDATE SET voicexp = voicexp + ?', [userid, amount, amount]);
}

function setXP(userid, textxp, voicexp) {
    const db = getDB();
    if (!db) return;
    db.run('INSERT INTO users (userid, textxp, voicexp) VALUES (?, ?, ?) ON CONFLICT(userid) DO UPDATE SET textxp = ?, voicexp = ?', [userid, textxp, voicexp, textxp, voicexp]);
}

function getUserXP(userid) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        if (!db) {
            resolve({ textxp: 0, voicexp: 0 });
            return;
        }

        db.get('SELECT textxp, voicexp FROM users WHERE userid = ?', [userid], (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            if (!row) {
                resolve({ textxp: 0, voicexp: 0 });
                return;
            }

            resolve({ textxp: row.textxp, voicexp: row.voicexp });
        });
    });
}

function getUserConfig(userid) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        if (!db) {
            resolve({ participate: true, pinned: true });
            return;
        }

        db.get('SELECT participate, pinned FROM users WHERE userid = ?', [userid], (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            if (!row) {
                resolve({ participate: true, pinned: true });
                return;
            }

            resolve({ participate: row.participate === 0 ? false : true, pinned: row.pinned === 0 ? false : true });
        });
    });
}

function setUserConfig(userid, { participate = null, pinned = null } = {}) {
    const db = getDB();
    if (!db) return;

    db.get('SELECT participate, pinned FROM users WHERE userid = ?', [userid], (err, row) => {
        if (err) return;

        const curParticipate = row ? (row.participate === 0 ? 0 : 1) : 1;
        const curPinned = row ? (row.pinned === 0 ? 0 : 1) : 1;

        const newParticipate = (participate === null) ? curParticipate : (participate ? 1 : 0);
        const newPinned = (pinned === null) ? curPinned : (pinned ? 1 : 0);

        db.run('INSERT INTO users (userid, participate, pinned) VALUES (?, ?, ?) ON CONFLICT(userid) DO UPDATE SET participate = ?, pinned = ?', [userid, newParticipate, newPinned, newParticipate, newPinned]);
    });
}
function setUserConfig(userid, { participate = null, pinned = null } = {}) {
    const db = getDB();
    if (!db) return Promise.reject(new Error('DB not initialized'));

    return new Promise((resolve, reject) => {
        db.get('SELECT participate, pinned FROM users WHERE userid = ?', [userid], (err, row) => {
            if (err) return reject(err);

            const curParticipate = row ? (row.participate === 0 ? 0 : 1) : 1;
            const curPinned = row ? (row.pinned === 0 ? 0 : 1) : 1;

            const newParticipate = (participate === null) ? curParticipate : (participate ? 1 : 0);
            const newPinned = (pinned === null) ? curPinned : (pinned ? 1 : 0);

            db.run('INSERT INTO users (userid, participate, pinned) VALUES (?, ?, ?) ON CONFLICT(userid) DO UPDATE SET participate = ?, pinned = ?', [userid, newParticipate, newPinned, newParticipate, newPinned], function(runErr) {
                if (runErr) return reject(runErr);
                resolve({ participate: newParticipate === 1, pinned: newPinned === 1 });
            });
        });
    });
}

module.exports = {
    calculateLevel,
    addTextXP,
    addVoiceXP,
    getUserXP,
    setXP
    ,getUserConfig
    ,setUserConfig
}