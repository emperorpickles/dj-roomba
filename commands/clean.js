const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clean')
        .setDescription('Deletes all of DJ messages.'),
    async execute() {
        // command code goes here
    },
};