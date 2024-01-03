const guilds = require('./guilds');
const logger = require('../utils/bunyan');
const { AudioPlayerStatus } = require('@discordjs/voice');

function addSongToQueue(interaction, songs) {
    const guildQueue = guilds.getQueue(interaction);
    guildQueue.songs.push(...songs);
    if (!guildQueue.currentSong) {
        // new queue, add first song in queue to currentSong
        guildQueue.currentSong = guildQueue.songs.shift();
    };
    logger.info(`Current song queue ${guildQueue.songs} in ${interaction.guild.name}`);
};

async function play(interaction) {
    const guildQueue = guilds.getQueue(interaction);
    const guildAudioPlayer = guilds.getAudioPlayer(guildQueue);
    await guilds.createVoiceConnection(interaction);

    logger.info(`Current song ${guildQueue.currentSong.title} in ${interaction.guild.name}`);

    guildAudioPlayer.play(guildQueue.currentSong.resource);
    guilds.getGuildVoiceConnection(interaction).subscribe(guildAudioPlayer);

    guildAudioPlayer.on(AudioPlayerStatus.Idle, () => {
        guildQueue.currentSong = null;
        if (guildQueue.songs.length > 0) {
            guildQueue.currentSong = guildQueue.songs.shift();
            guildAudioPlayer.play(guildQueue.currentSong.resource);
        } else {
            guilds.destroyVoiceConnection(interaction);
        }
    });
}



// code to be rewritten
// create a new song queue for guild
/* if (!guildQueue) {
    const audioPlayer = voice.createAudioPlayer();

    audioPlayer.on('error', error => {
        // TODO - improve error logging
        logger.error(`ERROR: ${error.message} with resource ${error.resource}`);
        logger.error(error);
    });

    const queueConstruct = {
        interaction: interaction,
        voiceChannel: voiceChannel,
        audioPlayer: audioPlayer,
        songs: songs,
        currentSong: null,
        messages: [],
    };

    queue.set(interaction.guild.id, queueConstruct);

    try {
        await connectToChannel(voiceChannel);
        if (songs.length > 0) {
            let newSongs = '';
            songs.forEach((song, i) => {
                newSongs += `\n${i+1}. ${song.title}`;
            });
            sendMessage(message, `\`\`\`Added to queue:${newSongs}\`\`\``);
        }
        await play(interaction.guild, queueConstruct.songs.shift());
    } catch (err) {
        logger.error(err);
        queue.delete(interaction.guild.id);
    }
}
// song queue already exists, add new song to end of queue
else {
    guildQueue.songs.push(...songs);
    if (songs.length > 0) {
        let newSongs = '';
        songs.forEach((song, i) => {
            newSongs += `\n${i+1}. ${song.title}`;
        });
        return sendMessage(message, `\`\`\`Added to queue:${newSongs}\`\`\``);
    } else {
        return sendMessage(message, `**${songs[0].title}** has been added to the queue`);
    }
} */

module.exports = {
    addSongToQueue,
    play,
}