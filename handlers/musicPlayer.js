const { joinVoiceChannel, getVoiceConnection, createAudioPlayer } = require('@discordjs/voice');
const { Queue } = require('../classes/Queue');

function getQueue(interaction) {
    const queues = interaction.client.guildQueues;
    let guildQueue = queues.get(interaction.guildId);

    if (!guildQueue) {
        guildQueue = new Queue(interaction)
        queues.set(interaction.guildId, guildQueue)
    }

    return guildQueue;
}

function getAudioPlayer(guildQueue) {
    if (!guildQueue.audioPlayer) {
        const audioPlayer = createAudioPlayer();
        guildQueue.audioPlayer = audioPlayer;
        return audioPlayer;
    } else {
        return guildQueue.audioPlayer;
    }
}

function voiceConnection(interaction) {
    let connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        connection = joinVoiceChannel({
            channelId: interaction.channelId,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });
    }
    return connection;
}

async function play(interaction, songs) {
    const guildQueue = getQueue(interaction);
    const audioPlayer = getAudioPlayer(guildQueue);
    const connection = voiceConnection(interaction);

    if (!guildQueue.currentSong) {
        
    }
    guildQueue.songs.push(...songs);
}

// create a new song queue for guild
if (!guildQueue) {
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
}

module.exports = {play}