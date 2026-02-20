const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAllConfig } = require('../../backend/config.js');
const sql = require('../../backend/sql.js');
const fs = require('fs').promises;
const pkg = require('../../../package.json');

function humanBytes(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function humanDuration(sec) {
    sec = Math.floor(sec);
    const days = Math.floor(sec / 86400);
    sec %= 86400;
    const hrs = Math.floor(sec / 3600);
    sec %= 3600;
    const mins = Math.floor(sec / 60);
    sec %= 60;
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hrs) parts.push(`${hrs}h`);
    if (mins) parts.push(`${mins}m`);
    parts.push(`${sec}s`);
    return parts.join(' ');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Ping the pot (diagnostics)'),
    async execute(interaction, client) {
        const cfg = getAllConfig() || {};
        const dbPath = cfg.database_path || './levels.db';

        let dbSize = 'unknown';
        try {
            const st = await fs.stat(dbPath);
            dbSize = humanBytes(st.size);
        } catch (e) {
            dbSize = 'not found';
        }

        let userCount = 'unknown';
        try {
            const db = sql.getDB();
            if (db) {
                userCount = await new Promise((res) => db.get('SELECT COUNT(*) AS c FROM users', [], (err, row) => {
                    if (err || !row) return res('unknown');
                    res(String(row.c));
                }));
            }
        } catch (e) {
            userCount = 'unknown';
        }

        const wsPing = client && client.ws && typeof client.ws.ping === 'number' ? `${Math.round(client.ws.ping)} ms` : 'unknown';
        const rtt = interaction && interaction.createdTimestamp ? `${Date.now() - interaction.createdTimestamp} ms` : 'unknown';
        const uptime = humanDuration(process.uptime());
        const version = (pkg && pkg.version) ? pkg.version : 'unk';
        const botId = client && client.user ? client.user.id : 'unknown';

        const embed = new EmbedBuilder()
            .setTitle('Pong — Diagnostics')
            .addFields(
                { name: 'WS Ping', value: wsPing, inline: true },
                { name: 'RTT', value: rtt, inline: true },
                { name: 'Uptime', value: uptime, inline: true },
                { name: 'Version', value: version, inline: true },
                { name: 'Bot ID', value: botId, inline: true },
                { name: 'DB Size', value: dbSize, inline: true },
                { name: 'Known Users', value: String(userCount), inline: true }
            )
            .setTimestamp();

        try {
            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            await interaction.reply('Pong! (failed to build embed)');
        }
    }
};
