const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getAllConfig } = require('../../backend/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Ping the pot'),
    async execute(interaction) {
        await interaction.reply("Pong!");
    }
};
