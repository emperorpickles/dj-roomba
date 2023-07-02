const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Adds a song to the play queue.'),
    async execute() {
        // play command code goes here
    },
};