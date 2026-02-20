const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getKey } = require('../../backend/config.js');
const { setXP } = require('../../backend/algorithm.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setxp')
        .setDescription('Sets XP for a user')
        .addIntegerOption(option =>
            option.setName('textxp')
                .setDescription('The amount of TextXP to set')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to set XP for')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const textxp = interaction.options.getInteger('textxp');
        const user = interaction.options.getUser('user');

        console.log(`${interaction.user.tag} setting TextXP to ${textxp} for user ${user.tag} (${user.id})`);

        const log_channel_id = getKey('log_channel_id');
        const log_channel = client.channels.cache.get(log_channel_id);
        if (log_channel) {
            log_channel.send(`<@${interaction.user.id}> set TextXP to \`${textxp}\` for user <@${user.id}> (${user.id})`);
        } else {
            console.warn("No log channel found! Logging administrator actions is highly recommended!");
        }

        setXP(user.id, textxp, 0);

        await interaction.reply({ content: `Set TextXP to \`${textxp}\` for user <@${user.id}>`, allowedMentions: { parse: [] }, ephemeral: true });
    }
};
