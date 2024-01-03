const { SlashCommandBuilder } = require('discord.js');
const index = require('../index');
const guilds = require('../handlers/guilds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current song and goes to the next in the queue.'),
    async execute(interaction) {
        await interaction.reply('Skipping song...');
        const guildQueue = index.client.guildQueues.get(interaction.guildId);
        guildQueue.currentSong = guildQueue.songs.shift();
        guilds.getAudioPlayer(guildQueue).play(guildQueue.currentSong.resource);
    },
};