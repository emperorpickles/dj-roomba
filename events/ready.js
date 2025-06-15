const { Events } = require('discord.js');
const logger = require('../utils/bunyan').child({ module: 'events/ready' });

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        const log = logger.child({ fn: 'execute' });
        log.info(`Ready! Logged in as ${client.user.tag}`);
    },
};