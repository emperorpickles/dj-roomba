const { SlashCommandBuilder } = require('discord.js');
const player = require('../handlers/musicPlayer');
const index = require('../index');
const logger = require('../utils/bunyan').child({ module: 'commands/queue' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Displays the current song queue.'),
    async execute(interaction) {
        const log = logger.child({ fn: 'execute' });
        const guildQueue = index.client.guildQueues.get(interaction.guildId);
        const queue = player.getSongQueueString(guildQueue);

        log.debug({ queue }, 'Displaying current queue');
        await interaction.reply(`\`\`\`Currently playing: ${guildQueue.currentSong.title}\nCurrent queue:${queue}\`\`\``);
    },
};