const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserConfig } = require('../../backend/algorithm.js');
const logger = require('../../logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewuserconf')
        .setDescription('View a user\'s per-user preferences')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to view (defaults to yourself)')
                .setRequired(false)
        ),
    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        if (target.id !== interaction.user.id) {
            if (!interaction.member.permissions.has('Administrator')) {
                return interaction.reply({ content: 'You do not have permission to view other users\' config.', ephemeral: true });
            }
        }

        try {
            const conf = await getUserConfig(target.id);
            const embed = new EmbedBuilder()
                .setTitle(`User config for ${target.username}`)
                .addFields(
                    { name: 'Participate', value: conf.participate ? 'Yes' : 'No', inline: true },
                    { name: 'Pinged', value: conf.pinged ? 'Yes' : 'No', inline: true }
                )
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (err) {
            logger.error('Failed to fetch user config:', err);
            await interaction.reply({ content: 'Failed to fetch configuration.', ephemeral: true });
        }
    }
};
