const { SlashCommandBuilder } = require('discord.js');
const player = require('../handlers/musicPlayer');
const youtube = require('../handlers/youtube');
const logger = require('../utils/bunyan');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playskip')
        .setDescription('Clears the current queue and immediately starts playing the new song.')
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

        // get songs from youtube link
        const url = interaction.options.getString('url');
        try {
            songs = await youtube.createSongsFromUrl(url);
        } catch (err) {
            logger.error('ERROR at play/1:\n', err);
            return await interaction.followUp('Please provide a valid YouTube link!');
        }

        // clear current queue and add songs to guild queue
        let newSongs = '';
        try {
            logger.debug(songs);
            player.clearQueue(interaction);
            newSongs = player.addSongToQueue(interaction, songs);
        } catch (err) {
            logger.error('ERROR at play/2:\n', err);
            return await interaction.followUp('Error adding song to queue.');
        }

        await interaction.editReply(`\`\`\`Added to queue:${newSongs}\`\`\``);
 
        await player.play(interaction);
    },
};