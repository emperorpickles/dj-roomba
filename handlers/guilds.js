const { joinVoiceChannel, getVoiceConnection, createAudioPlayer } = require('@discordjs/voice');
const { Queue } = require('../classes/Queue');
const logger = require('../utils/bunyan');

function getQueue(interaction) {
    logger.debug(interaction.client);
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

// getQueue - returns the queue for the guild. If no queue exists, creates a new one
// getAudioPlayer - returns the audio player for the guild. If no audio player exists, creates a new one
// voiceConnection - returns the voice connection for the guild. If no voice connection exists, creates a new one
module.exports = {
    getQueue,
    getAudioPlayer,
    voiceConnection,
};
