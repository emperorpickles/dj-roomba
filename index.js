const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const logger = require('./utils/bunyan').child({ module: 'index' });

// environment variables
require('dotenv').config();
const BOT_TOKEN = process.env.BOT_TOKEN;

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent]
});
client.guildQueues = new Collection();

// slash command handler
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // set a new item in the Collection with command name as the key and the exported module as the value
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        const log = logger.child({ fn: 'loadCommands' });
        log.info(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// events handler
const eventsPath = path.join(__dirname, 'events');
const eventsFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventsFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

module.exports.client = client;

logger.info({ fn: 'login' }, 'Logging in');
client.login(BOT_TOKEN);
