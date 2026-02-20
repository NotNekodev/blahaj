const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getAllConfig } = require('../../backend/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removemp')
        .setDescription('Remove multiplier for a role')
        .addMentionableOption(option =>
            option.setName('role')
                .setDescription('The role to remove the multiplier for')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
        
        const role = interaction.options.getMentionable('role');

        const config = getAllConfig();
        delete config.multipliers[role.id];
        await config.save();

        const embed = new EmbedBuilder()
            .setTitle('Multiplier Removed')
            .setDescription(`Removed multiplier for <@&${role.id}>`)
            .setColor(0x00AE86);
            
        await interaction.reply({ embeds: [embed], allowedMentions: { parse: [] }, ephemeral: true });
    }
};
