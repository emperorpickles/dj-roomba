const { SlashCommandBuilder } = require('discord.js');
const player = require('../handlers/musicPlayer');
const youtube = require('../handlers/youtube');
const logger = require('../utils/bunyan').child({ module: 'commands/play' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Adds a song to the play queue.')
        .addStringOption(option => 
            option.setName('url')
                .setDescription('URL for the YouTube video/playlist.')
                .setRequired(true)),
    async execute(interaction) {
        const log = logger.child({ fn: 'execute' });

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
            log.error({ err }, 'Failed to create songs from URL');
            return await interaction.editReply('Please provide a valid YouTube link!');
        }

        // add songs to guild queue
        let newSongs = '';
        try {
            log.debug({ songs }, 'Songs retrieved from YouTube');
            newSongs = player.addSongToQueue(interaction, songs);
        } catch (err) {
            log.error({ err }, 'Failed to add songs to queue');
            return await interaction.editReply('Error adding song to queue.');
        }

        await interaction.editReply(`\`\`\`Added to queue:${newSongs}\`\`\``);
 
        await player.play(interaction);
    },
};