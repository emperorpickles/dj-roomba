const guilds = require('./guilds');
const logger = require('../utils/bunyan');
const { AudioPlayerStatus } = require('@discordjs/voice');

function addSongToQueue(interaction, songs) {
    // get guild queue and add songs to queue
    const guildQueue = guilds.getQueue(interaction);
    guildQueue.songs.push(...songs);

    // create string of songs added to queue
    let newSongs = '';
    songs.forEach((song, i) => {
        newSongs += `\n${i+1}. ${song.title}`;
    });
    
    logger.info(`Added to queue: [${newSongs}\n] in ${interaction.guild.name}`);
    
    // new queue, add first song in queue to currentSong
    if (!guildQueue.currentSong) {
        guildQueue.currentSong = guildQueue.songs.shift();
    };
    
    return newSongs;
};

function getSongQueueString(guildQueue) {
    let songQueueString = '';
    if (guildQueue.songs.length === 0) {
        songQueueString = '\nNo songs in queue.'
    } else {
        guildQueue.songs.forEach((song, i) => {
            songQueueString += `\n${i+1}. ${song.title}`;
        });
    }
    return songQueueString;
};

async function play(interaction) {
    // get guild queue and audio player and create voice connection
    const guildQueue = guilds.getQueue(interaction);
    const guildAudioPlayer = guilds.getAudioPlayer(guildQueue);
    await guilds.createVoiceConnection(interaction);

    logger.info(`Current song: '${guildQueue.currentSong.title}' in '${interaction.guild.name}'`);

    // play current song and subscribe voice connection to audio player
    guildAudioPlayer.play(guildQueue.currentSong.resource);
    guilds.getGuildVoiceConnection(interaction).subscribe(guildAudioPlayer);

    // when audio player is idle, play next song in queue
    guildAudioPlayer.on(AudioPlayerStatus.Idle, () => {
        guildQueue.currentSong = null;
        if (guildQueue.songs.length > 0) {
            guildQueue.currentSong = guildQueue.songs.shift();
            logger.info(`Now playing: '${guildQueue.currentSong.title}' in '${interaction.guild.name}'`);
            guildAudioPlayer.play(guildQueue.currentSong.resource);
        } else {
            guilds.destroyVoiceConnection(interaction);
        }
    });
};

function clearQueue(interaction) {
    const guildQueue = guilds.getQueue(interaction);
    guildQueue.songs = [];
    guildQueue.currentSong = null;
}

// addSongToQueue - adds songs to the guild queue
// getSongQueueString - returns a string of the guild queue
// play - plays the current song in the guild queue
// clearQueue - clears the guild queue
module.exports = {
    addSongToQueue,
    getSongQueueString,
    play,
    clearQueue,
}