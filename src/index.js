const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const { getKey, initConfig } = require('./backend/config.js');
const { addTextXP, getUserXP } = require('./backend/algorithm.js');
const { initDB } = require('./backend/sql.js');
const loggerModule = require('./logger');

const program = new Command();
program.option('-m, --migrate-xp <file>', 'migrate XP data from a JSON file');
program.option('-c, --config <file>', 'specify a custom config file');
program.parse(process.argv);
const options = program.opts();

initConfig(options.config);

loggerModule.configure({ logFile: getKey('log_file') || undefined });
const logger = loggerModule.getLogger();

initDB(getKey('database_path') || './levels.db');

const usersCooldown = new Map();
const TEXT_COOLDOWN = getKey('textXP').cooldown * 1000;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'frontend/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
}

client.once('clientReady', async () => {
    logger.info(`Logged in as ${client.user.tag}`);

    if (options.migrateXp) {
        if (!fs.existsSync(options.migrateXp)) {
            logger.error('XP file not found!');
            return;
        }
        const xpData = JSON.parse(fs.readFileSync(options.migrateXp));
        for (const [userid, xp] of Object.entries(xpData)) {
            addTextXP(userid, xp);
            logger.debug(`Migrated XP for user ${userid}: TextXP ${xp}`);
        }
    }

    const rest = new REST({ version: '10' }).setToken(getKey('token'));
    const commandsJSON = client.commands.map(cmd => cmd.data.toJSON());

    try {
        await rest.put(
            Routes.applicationGuildCommands(
                getKey('application_id'),
                getKey('guild_id')
            ),
            { body: commandsJSON }
        );
        logger.info('Registered following slash commands:');
        client.commands.forEach(cmd => logger.info(`- ${cmd.data.name}`));
    } catch (err) {
        logger.error('Failed to register commands:', err);
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const now = Date.now();
    const last = usersCooldown.get(message.author.id) || 0;

    if (now - last >= TEXT_COOLDOWN) {
        const baseXp = Math.floor(Math.random() * getKey('textXP').maxGain) + getKey('textXP').minGain;
        const multipliers = getKey('multipliers') || {};
        let roleMultiplier = 1.0;
        try {
            if (message.member && message.member.roles && message.member.roles.cache) {
                for (const role of message.member.roles.cache.values()) {
                    const m = multipliers[role.id];
                    const num = typeof m === 'number' ? m : parseFloat(m);
                    if (!Number.isNaN(num) && num > roleMultiplier) roleMultiplier = num;
                }
            }
        } catch (err) {
            logger.error('Failed to compute role multiplier:', err);
        }

        const xpGain = Math.max(0, Math.floor(baseXp * roleMultiplier));
        if (roleMultiplier !== 1.0) logger.debug(`Applied role multiplier ${roleMultiplier} to user ${message.author.id}, base ${baseXp} -> ${xpGain}`);
        addTextXP(message.author.id, xpGain);
        usersCooldown.set(message.author.id, now);

        const userXP = await getUserXP(message.author.id);
        logger.info(`${message.author.tag} now has TextXP: ${userXP.textxp}, VoiceXP: ${userXP.voicexp}`);
    } else {
        const remaining = Math.ceil((TEXT_COOLDOWN - (now - last)) / 1000);
        logger.info(`${message.author.tag} is on cooldown. ${remaining} seconds remaining.`);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (err) {
        logger.error(err);
        try {
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: 'Error executing command.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Error executing command.', ephemeral: true });
            }
        } catch (replyErr) {
            logger.error('Failed to send error reply for interaction:', replyErr);
        }
    }
});

client.login(getKey('token'));

module.exports = {
    options,
    client,
    logger
};