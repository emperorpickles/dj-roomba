const { SlashCommandBuilder } = require('discord.js');
const index = require('../index');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the music.'),
    async execute(interaction) {
        await interaction.reply('Stopping music...');
        const guildQueue = index.client.guildQueues.get(interaction.guildId);

        guildQueue.songs = [];
        guildQueue.currentSong = null;

        guildQueue.audioPlayer.stop();
    },
};