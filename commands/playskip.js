const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playskip')
        .setDescription('Clears the current queue and immediately starts playing the new song.'),
    async execute() {
        // command code goes here
    },
};