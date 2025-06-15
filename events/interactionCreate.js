const { Events } = require('discord.js');
const logger = require('../utils/bunyan').child({ module: 'events/interactionCreate' });

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const log = logger.child({ fn: 'execute' });
        if (!interaction.isChatInputCommand()) return;
        log.debug({ interaction }, 'Received interaction');

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            log.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            log.error({ err: error }, `Error executing ${interaction.commandName}`);
        }
    },
};