const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Returns the top 5 results from YouTube for the given search term. Respond with the number of the result you want to add to the queue!'),
    async execute() {
        // command code goes here
    },
};