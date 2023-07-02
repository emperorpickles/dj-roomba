const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Displays the current song queue.'),
    async execute() {
        // command code goes here
    },
};