const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const logger = require('./utils/bunyan').child({ module: 'commands-test-deploy' });

// environment variables
require('dotenv').config();
const BOT_TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const commands = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
        if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
        } else {
                logger.warn({ fn: 'loadCommands' }, `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(BOT_TOKEN);

// and deploy your commands!
(async () => {
        try {
                logger.info({ fn: 'deploy' }, `Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
			{ body: commands },
		);

                logger.info({ fn: 'deploy' }, `Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
                // And of course, make sure you catch and log any errors!
                logger.error({ fn: 'deploy', err: error }, 'Failed to deploy commands');
        }
})();