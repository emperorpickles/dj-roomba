const { SlashCommandBuilder } = require('discord.js');
const index = require('../index');
const logger = require('../utils/bunyan').child({ module: 'commands/stop' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the music.'),
    async execute(interaction) {
        const log = logger.child({ fn: 'execute' });
        await interaction.reply('Stopping music...');
        const guildQueue = index.client.guildQueues.get(interaction.guildId);

        guildQueue.songs = [];
        guildQueue.currentSong = null;
        log.info(`Stopping playback in '${interaction.guild.name}'`);

        guildQueue.audioPlayer.stop();
    },
};