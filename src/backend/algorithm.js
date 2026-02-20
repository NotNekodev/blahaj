const { db } = require('./sql');

function calculateLevel(userid) {
    return new Promise((resolve, reject) => {
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
    db.run('INSERT INTO users (userid, textxp) VALUES (?, ?) ON CONFLICT(userid) DO UPDATE SET textxp = textxp + ?', [userid, amount, amount]);
}

function addVoiceXP(userid, amount) {
    db.run('INSERT INTO users (userid, voicexp) VALUES (?, ?) ON CONFLICT(userid) DO UPDATE SET voicexp = voicexp + ?', [userid, amount, amount]);
}

function setXP(userid, textxp, voicexp) {
    db.run('INSERT INTO users (userid, textxp, voicexp) VALUES (?, ?, ?) ON CONFLICT(userid) DO UPDATE SET textxp = ?, voicexp = ?', [userid, textxp, voicexp, textxp, voicexp]);
}

function getUserXP(userid) {
    return new Promise((resolve, reject) => {
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

module.exports = {
    calculateLevel,
    addTextXP,
    addVoiceXP,
    getUserXP,
    setXP
}