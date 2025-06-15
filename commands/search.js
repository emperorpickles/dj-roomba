const { SlashCommandBuilder } = require('discord.js');
const youtube = require('../handlers/youtube');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Returns the top 5 results from YouTube. Choose the one you want to add to the queue!')
        .addStringOption(option => 
            option.setName('search_term')
                .setDescription('Search term for the YouTube video.')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.reply('Searching YouTube...');
        const searchTerm = interaction.options.getString('search_term');
        const results = await youtube.search(searchTerm);
        let resultString = '';
        results.forEach((result, i) => {
            resultString += `\n${i+1}. ${result.title}`;
        });
        await interaction.editReply(`\`\`\`${resultString}\`\`\``);
    },
};