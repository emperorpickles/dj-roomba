const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, VoiceConnectionStatus } = require('@discordjs/voice');
const Queue = require('../classes/Queue');
const index = require('../index');
const logger = require('../utils/bunyan');

function getQueue(interaction) {
    const queues = index.client.guildQueues;
    let guildQueue = queues.get(interaction.guildId);

    if (!guildQueue) {
        guildQueue = Queue.newQueue(interaction);
        queues.set(interaction.guildId, guildQueue);
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

async function createVoiceConnection(interaction) {
    const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
        logger.info(`Joined voice channel: '${interaction.member.voice.channel.name}' in '${interaction.guild.name}'`);
        return;
    });
}

function getGuildVoiceConnection(interaction) {
    const connection = getVoiceConnection(interaction.guildId);
    return connection;
}

function destroyVoiceConnection(interaction) {
    const connection = getVoiceConnection(interaction.guildId);
    if (connection) {
        connection.destroy();
    }
}

// getQueue - returns the queue for the guild. If no queue exists, creates a new one
// getAudioPlayer - returns the audio player for the guild. If no audio player exists, creates a new one
// createVoiceConnection - creates a voice connection for the guild
// getGuildVoiceConnection - returns the voice connection for the guild
// destroyVoiceConnection - destroys the voice connection for the guild
module.exports = {
    getQueue,
    getAudioPlayer,
    createVoiceConnection,
    getGuildVoiceConnection,
    destroyVoiceConnection,
};
