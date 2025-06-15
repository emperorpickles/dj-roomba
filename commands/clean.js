const { SlashCommandBuilder } = require('discord.js');
const logger = require('../utils/bunyan').child({ module: 'commands/clean' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clean')
        .setDescription('Deletes all of DJ messages.'),
    async execute() {
        const log = logger.child({ fn: 'execute' });
        log.info('Clean command executed');
        // command code goes here
    },
};