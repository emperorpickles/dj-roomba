const { SlashCommandBuilder, InteractionCollector } = require('discord.js');
const player = require('../handlers/musicPlayer');
const youtube = require('../handlers/youtube');
const logger = require('../utils/bunyan');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Adds a song to the play queue.')
        .addStringOption(option => 
            option.setName('url')
                .setDescription('URL for the YouTube video/playlist.')
                .setRequired(true)),

    async execute(interaction) {
        // get users voice channel
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return await interaction.reply('You need to be in a voice channel!');
        }

        await interaction.reply('Adding song(s) to queue...');

        const url = interaction.options.getString('url');
        // get songs from youtube link
        try {
            songs = await youtube.createSongsFromUrl(url);
        } catch (err) {
            logger.error(err);
            return await interaction.reply('Please provide a valid YouTube link!');
        }

        // add songs to guild queue
        try {
            logger.debug(songs);
            player.addSongToQueue(interaction, songs);
        } catch (err) {
            logger.error(err);
            return await interaction.reply('Error adding song to queue.');
        }

        await interaction.followUp(`Added ${songs[0].title} to the queue.`);
 
        await player.play(interaction);
    }
}