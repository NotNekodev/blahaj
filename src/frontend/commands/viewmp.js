const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getAllConfig } = require('../../backend/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewmp')
        .setDescription('View multiplier values for roles'),
    async execute(interaction) {
        const config = getAllConfig();
        const multipliers = config.multipliers || {};

        const embed = new EmbedBuilder()
            .setTitle('Role Multipliers')
            .setDescription(Object.entries(multipliers).map(([roleId, multiplier]) => `<@&${roleId}> \`${multiplier.toFixed(2)}x\` Multiplier`).join('\n') || 'No multipliers set.')
            .setColor(0x00AE86);

        await interaction.reply({ embeds: [embed] });
    }
};
