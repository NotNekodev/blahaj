const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getAllConfig } = require('../../backend/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setmp')
        .setDescription('Set multiplier for a role')
        .addMentionableOption(option =>
            option.setName('role')
                .setDescription('The role to set the multiplier for')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('multiplier')
                .setDescription('The multiplier value (e.g., 1.5 for 1.5x)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
        
        const role = interaction.options.getMentionable('role');
        const multiplier = interaction.options.getNumber('multiplier');

        const config = getAllConfig();
        config.multipliers[role.id] = multiplier;
        await config.save();

        const embed = new EmbedBuilder()
            .setTitle('Multiplier Set')
            .setDescription(`Set multiplier for <@&${role.id}> to \`${multiplier.toFixed(2)}x\``)
            .setColor(0x00AE86);
            
        await interaction.reply({ embeds: [embed], allowedMentions: { parse: [] }, ephemeral: true });
    }
};
