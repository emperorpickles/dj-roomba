const { Events } = require('discord.js');
const logger = require('../utils/bunyan');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        logger.debug(generateDependencyReport());
        logger.info(`Ready! Logged in as ${client.user.tag}`);
    },
};