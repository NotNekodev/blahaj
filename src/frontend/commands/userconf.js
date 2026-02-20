const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getUserConfig } = require('../../backend/algorithm.js');
const logger = require('../../logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userconf')
        .setDescription('Set your per-user leveling preferences'),
    async execute(interaction) {
        try {
            const cur = await getUserConfig(interaction.user.id);

            const participateOptions = [
                new StringSelectMenuOptionBuilder().setLabel('Yes').setValue('true').setDefault(cur.participate === true),
                new StringSelectMenuOptionBuilder().setLabel('No').setValue('false').setDefault(cur.participate === false)
            ];

            const participateSelect = new StringSelectMenuBuilder()
                .setCustomId('userconf_select_participate')
                .setPlaceholder('Participate in leveling?')
                .addOptions(...participateOptions);

            const pingedOptions = [
                new StringSelectMenuOptionBuilder().setLabel('Yes').setValue('true').setDefault(cur.pinged === true),
                new StringSelectMenuOptionBuilder().setLabel('No').setValue('false').setDefault(cur.pinged === false)
            ];

            const pingedSelect = new StringSelectMenuBuilder()
                .setCustomId('userconf_select_pinged')
                .setPlaceholder('Pinged when leveling?')
                .addOptions(...pingedOptions);

            const saveButton = new ButtonBuilder()
                .setCustomId('userconf_save')
                .setLabel('Save')
                .setStyle(ButtonStyle.Success);

            const cancelButton = new ButtonBuilder()
                .setCustomId('userconf_cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary);

            await interaction.reply({
                content: 'Select your preferences, then press Save.',
                components: [
                    new ActionRowBuilder().addComponents(participateSelect),
                    new ActionRowBuilder().addComponents(pingedSelect),
                    new ActionRowBuilder().addComponents(saveButton, cancelButton)
                ],
                ephemeral: true
            });
        } catch (err) {
            logger.error('Failed to open userconf selection UI:', err);
            await interaction.reply({ content: 'Failed to open preferences UI.', ephemeral: true });
        }
    }
};
