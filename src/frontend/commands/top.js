const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { db } = require('../../backend/sql.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Displays the top 10 users by XP')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number (10 users per page)')
                .setRequired(false)
        ),
    async execute(interaction, client) {
        await interaction.deferReply();
        const page = interaction.options.getInteger('page') || 1;
        const pageSize = 10;
        const offset = (page - 1) * pageSize;

        db.all('SELECT userid, textxp, voicexp FROM users ORDER BY (textxp + voicexp) DESC', async (err, allRows) => {
            if (err) {
                console.error(err);
                return interaction.reply('An error occurred while fetching top users.');
            }

            if (!allRows.length) {
                return interaction.reply('No users found.');
            }

            const userRank = allRows.findIndex(r => r.userid === interaction.user.id) + 1;
            const userRow = allRows[userRank - 1];

            const pageRows = allRows.slice(offset, offset + pageSize);

            const topUsers = await Promise.all(pageRows.map(async (row, i) => {
                try {
                    const user = await client.users.fetch(row.userid);
                    const totalXP = row.textxp + row.voicexp;
                    if (user.id === interaction.user.id) {
                        return `**#${offset + i + 1}. <@${user.id}> - \`${totalXP}\` XP**`;
                    }
                    return `#${offset + i + 1}. <@${user.id}> - \`${totalXP}\` XP`;
                } catch (err) {
                    const totalXP = row.textxp + row.voicexp;
                    return `#${offset + i + 1}. <@${row.userid}> - \`${totalXP}\` XP (User not found)`;
                }
            }));

            if (!pageRows.some(r => r.userid === interaction.user.id) && userRow) {
                const totalXP = userRow.textxp + userRow.voicexp;
                const userLine = `**#${userRank}. <@${interaction.user.id}> - \`${totalXP}\` XP**`;

                if (userRank <= offset) {
                    topUsers.unshift(userLine);
                } else {
                    topUsers.push(userLine);
                }
            }

            const guild = interaction.guild;
            const guildName = guild ? guild.name : 'Unknown Guild';
            const iconURL = guild ? guild.iconURL({ dynamic: true, size: 512 }) : client.user.displayAvatarURL();

            const embed = new EmbedBuilder()
                .setColor(0xA7D379)
                .setTitle(`Users by XP in ${guildName} [${page}/${Math.ceil(allRows.length / pageSize)}]`)
                .setAuthor({ name: 'NB Level Bot', iconURL })
                .setDescription(topUsers.join('\n'))
                .setFooter({ text: 'XP is the sum of TextXP and VoiceXP' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed], allowedMentions: { parse: [] } });
        });
    }
};
