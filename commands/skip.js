const { SlashCommandBuilder } = require('discord.js');
const index = require('../index');
const guilds = require('../handlers/guilds');
const logger = require('../utils/bunyan').child({ module: 'commands/skip' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current song and goes to the next in the queue.'),
    async execute(interaction) {
        const log = logger.child({ fn: 'execute' });
        await interaction.reply('Skipping song...');
        const guildQueue = index.client.guildQueues.get(interaction.guildId);
        guildQueue.currentSong = guildQueue.songs.shift();
        log.info(`Skipped to '${guildQueue.currentSong.title}' in '${interaction.guild.name}'`);
        guilds.getAudioPlayer(guildQueue).play(guildQueue.currentSong.resource);
    },
};