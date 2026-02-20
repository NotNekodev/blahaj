const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getAllConfig } = require('../../backend/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Displays information about the config')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
        
        let config_strings = [];
        for (const [key, value] of Object.entries(getAllConfig())) {
            if (typeof value === 'object') {
                for (const [subKey, subValue] of Object.entries(value)) {
                    config_strings.push(`\`${key}.${subKey}\` -> \`${subValue}\``);
                }
            } else {
                config_strings.push(`\`${key}\` -> \`${value}\``);
            }
        }

        const guild = interaction.guild;
        const guildName = guild ? guild.name : 'Unknown Guild';
        const iconURL = guild ? guild.iconURL({ dynamic: true, size: 512 }) : client.user.displayAvatarURL();

        const embed = new EmbedBuilder()
            .setColor(0xA7D379)
            .setTitle(`Config of ${guildName}`)
            .setAuthor({ name: 'NB Level Bot', iconURL })
            .setDescription(config_strings.join('\n'))
            .setFooter({ text: 'XP is the sum of TextXP and VoiceXP' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], allowedMentions: { parse: [] }, ephemeral: true });
    }
};
