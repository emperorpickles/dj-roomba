const { SlashCommandBuilder } = require('discord.js');
const youtube = require('../handlers/youtube');
const logger = require('../utils/bunyan').child({ module: 'commands/search' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Returns the top 5 results from YouTube. Choose the one you want to add to the queue!')
        .addStringOption(option => 
            option.setName('search_term')
                .setDescription('Search term for the YouTube video.')
                .setRequired(true)),
    async execute(interaction) {
        const log = logger.child({ fn: 'execute' });
        await interaction.reply('Searching YouTube...');
        const searchTerm = interaction.options.getString('search_term');
        log.debug({ searchTerm }, 'Searching YouTube');
        const results = await youtube.search(searchTerm);
        let resultString = '';
        results.forEach((result, i) => {
            resultString += `\n${i+1}. ${result.title}`;
        });
        log.debug({ results: resultString }, 'Search results');
        await interaction.editReply(`\`\`\`${resultString}\`\`\``);
    },
};