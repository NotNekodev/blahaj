const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getKey } = require('../../backend/config.js');
const { addTextXP } = require('../../backend/algorithm.js');
const logger = require('../../logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subxp')
        .setDescription('Subtracts XP for a user')
        .addIntegerOption(option =>
            option.setName('textxp')
                .setDescription('The amount of TextXP to subtract')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to subtract XP for')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const textxp = interaction.options.getInteger('textxp');
        const user = interaction.options.getUser('user');

        logger.info(`${interaction.user.tag} subtracting TextXP to ${textxp} for user ${user.tag} (${user.id})`);

        const log_channel_id = getKey('log_channel_id');
        const log_channel = client.channels.cache.get(log_channel_id);
        if (log_channel) {
            log_channel.send(`<@${interaction.user.id}> subtracted TextXP to \`${textxp}\` for user <@${user.id}> (${user.id})`);
        } else {
            logger.warn("No log channel found! Logging administrator actions is highly recommended!");
        }

        addTextXP(user.id, -textxp);

        await interaction.reply({ content: `Subtracted TextXP to \`${textxp}\` for user <@${user.id}>`, allowedMentions: { parse: [] }, ephemeral: true });
    }
};
