const { SlashCommandBuilder, InteractionCollector } = require('discord.js');
const player = require('../handlers/musicPlayer');

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

        const url = interaction.options.getString('url');
        // get songs from youtube link
        let songs = [];
        try {
            songs = await createSongsFromUrl(url);
        } catch (err) {
            return await interaction.reply('Please provide a valid YouTube link!');
        }

        player.play(interaction, songs);

        if (songs.length > 0) {
            let newSongs = '';
            songs.forEach((song, i) => {
                newSongs += `\n${i+1}. ${song.title}`;
            });
            return await interaction.reply(`\`\`\`Added to queue:${newSongs}\`\`\``);
        } else {
            return await interaction.reply(`**${songs[0].title}** has been added to the queue`);
        }
    },
};