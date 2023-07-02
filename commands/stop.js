const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the music.'),
    async execute() {
        // command code goes here
    },
};