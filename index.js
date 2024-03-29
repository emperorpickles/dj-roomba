const { Client, Events, GatewayIntentBits } = require('discord.js');
const voice = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const { YouTube, Video, Playlist } = require('youtube-sr');
const Firestore = require('@google-cloud/firestore');
const logger = require('./utils/bunyan');
const { generateDependencyReport } = require('@discordjs/voice')

// environment variables
require('dotenv').config();
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;
const PREFIX = process.env.PREFIX || '!';

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent] });

const queue = new Map();


// establish Firestore db connection
const db = new Firestore({
    projectId: GCP_PROJECT_ID,
})


// announce once the bot is online
client.once('ready', () => {
    logger.info(generateDependencyReport());
    logger.info(`Ready! Logged in as ${client.user.username}`);
    logger.info(`Active prefix: ${PREFIX}`);
});

// handles commands to bot
client.on('messageCreate', async message => {
    logger.info(message.content);
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const serverQueue = queue.get(message.guild.id);
    
    const args = message.content.slice(1).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'play' || command === 'p') {
        if (args.length === 0) {
            return sendMessage(message, 'Please include a Youtube link after the !play command');
        }
        execute(message, args, serverQueue);
        return;
    } else if (command === 'skip' || command === 's') {
        skip(message, serverQueue);
        return;
    } else if (command === 'stop' || command === 'clear') {
        stop(message, serverQueue);
        return;
    } else if (command === 'queue' || command === 'q') {
        showQueue(message, serverQueue);
        return;
    } else if (command === 'playskip' || command === 'ps') {
        if (args.length === 0) {
            return sendMessage(message, 'Please include a Youtube link after the !playskip command');
        }
        playSkip(message, args, serverQueue);
        return;
    } else if (command === 'clean') {
        clean(message);
        return;
    } else if (command === 'search') {
        ytSearch(message, args);
        return;
    }
});


// primary function, handles adding songs to queue
async function execute(message, args, serverQueue) {
    // get users voice channel
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return sendMessage(message, 'You need to be in a voice channel!');
    }
    
    // check if we have needed permissions
    // -- need to fix permissions check to use new GatewayIntentBits --
    // const permissions = voiceChannel.permissionsFor(message.client.user);
    // if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    //     return sendMessage(message, 'I need permissions to join and speak in your voice channel!');
    // }

    // create song from youtube link
    let songs = [];
    try {
        songs = await createSongsFromUrl(args[0]);
    } catch (err) {
        return sendMessage(message, 'Please provide a valid YouTube URL');
    }

    // create a new song queue for guild
    if (!serverQueue) {
        const audioPlayer = voice.createAudioPlayer();

        audioPlayer.on('error', error => {
            // TODO - improve error logging
            logger.error(`ERROR: ${error.message} with resource ${error.resource}`);
            logger.error(error);
        });

        const queueConstruct = {
            message: message,
            voiceChannel: voiceChannel,
            audioPlayer: audioPlayer,
            songs: songs,
            currentSong: null,
            messages: [],
        };

        queue.set(message.guild.id, queueConstruct);

        try {
            await connectToChannel(voiceChannel);
            if (songs.length > 0) {
                let newSongs = '';
                songs.forEach((song, i) => {
                    newSongs += `\n${i+1}. ${song.title}`;
                });
                sendMessage(message, `\`\`\`Added to queue:${newSongs}\`\`\``);
            }
            await play(message.guild, queueConstruct.songs.shift());
        } catch (err) {
            logger.error(err);
            queue.delete(message.guild.id);
        }
    }
    // song queue already exists, add new song to end of queue
    else {
        serverQueue.songs.push(...songs);
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
}

// removes current queue and plays the given song
async function playSkip(message, args, serverQueue) {
    if (!message.member.voice.channel) {
        return sendMessage(message, 'You need to be in a voice channel to play tracks!');
    }
    if (serverQueue) {
        let songs = [];
        try {
            songs = await createSongsFromUrl(args[0]);
        } catch (err) {
            return sendMessage(message, 'Please provide a valid YouTube URL');
        }

        serverQueue.songs = songs;
        play(message.guild, serverQueue.songs.shift());
    } else {
        execute(message, args, serverQueue);
    }
}

// skip songs
function skip(message, serverQueue) {
    if (!message.member.voice.channel) {
        return sendMessage(message, 'You need to be in a voice channel to skip tracks!');
    }
    if (serverQueue) {
        play(message.guild, serverQueue.songs.shift());
        logMessage(message);
    }
}

// stop player and clear queue
function stop(message, serverQueue) {
    if (!message.member.voice.channel) {
        return sendMessage(message, 'You need to be in a voice channel to stop the music!');
    }
    if (serverQueue) {
        sendMessage(message, 'Stopping music and leaving the voice channel!');
        voice.getVoiceConnection(message.guild.id).destroy();
        queue.delete(message.guild.id);
    }
}

// show the songs currently in queue
function showQueue(message, serverQueue) {
    if (!message.member.voice.channel) {
        return sendMessage(message, 'You need to be in a voice channel to view the queue!');
    }
    if (serverQueue) {
        songQueue = `\`\`\`Currently playing: ${serverQueue.currentSong.title}`;
        if (serverQueue.songs.length > 0) {
            songQueue += '\n\nUp next:';
            serverQueue.songs.forEach((song, i) => {
                songQueue += `\n${i+1}. ${song.title}`;
            });
        }
        return sendMessage(message, songQueue + '\`\`\`');
    }
}

// play current song in queue
async function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    serverQueue.currentSong = song;

    const connection = voice.getVoiceConnection(guild.id);

    if (!song) {
        connection.destroy();
        queue.delete(guild.id);
        return;
    }

    logger.info(`Now playing: ${song.title}`);

    try {
        const resource = song.getAudioResource();
        serverQueue.audioPlayer.play(resource);
        const subscription = connection.subscribe(serverQueue.audioPlayer);
        
        if (subscription) {
            sendMessage(serverQueue.message, `Now playing: **${song.title}**`);

            serverQueue.audioPlayer.once(voice.AudioPlayerStatus.Idle, async (oldState, newState) => {
                await play(guild, serverQueue.songs.shift());
            });
        }
    } catch (err) {
        logger.error(`ERROR: ${err.message} with song ${song.title}`);
        logger.error(err);
        await play(guild, serverQueue.songs.shift());
    }
}

// delete all messages related to the bot
async function clean(message) {
    await sendMessage(message, 'Cleaning up all of my messages!');
    
    const collection = db.collection('guilds').doc(message.guildId).collection('messages');
    const messages = await collection.get();
    
    logger.info(`Cleaning up ${messages.docs.length} messages...`);
    await Promise.all(messages.docs.map(async (doc) => {
        const data = doc.data();
        const msg = await client.channels.cache.get(data.channelId).messages.fetch(doc.id)
            .catch(err => { logger.error(err); return null });
        if (msg) {
            await msg.delete().catch(err => { logger.error(err) });
        }
    }));
    
    await new Promise((resolve, reject) => {
        deleteBatch(collection, resolve).catch(reject);
    });
    logger.info('Finished cleaning messages');
}

// youtube search
async function ytSearch(message, args) {
    await logMessage(message);

    const searchTerm = args.join(' ');
    const serverQueue = queue.get(message.guild.id);
    
    const videos = await YouTube.search(searchTerm, { limit: 5, type: "all" });
    
    let titles = '';
    videos.forEach((video, i) => {
        titles += `\n${i+1}. ${video.title}`;
        if (video instanceof Playlist) {
            titles += ` (${video.videoCount} videos)`;
        }
    });

    const filter = m => !isNaN(m.content);

    message.reply(`Search results:\`\`\`${titles}\`\`\``, { fetchReply: true })
        .then(res => {
            message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                .then(collected => {
                    const choice = videos[parseInt(collected.first().content) - 1];

                    let videoUrl = '';
                    if (choice instanceof Video) {
                        videoUrl = `https://www.youtube.com/watch?v=${choice.id}`;
                    } else {
                        videoUrl = choice.url;
                    }

                    execute(message, [videoUrl], serverQueue);
                    res.delete().catch(err => { logger.error(err) });
                    collected.first().delete().catch(err => { logger.error('ERROR ytSearch().1:\n', err) });
                })
                .catch(collected => {
                    res.delete().catch(err => { logger.error('ERROR ytSearch().2:\n', err) });
                });
        });
        
}


// firestore batch delete function
async function deleteBatch(query, resolve) {
    const snapshot = await query.get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    resolve();
    return;
}

// helper function for getting youtube video urls
async function createSongsFromUrl(rawUrl) {
    let url = null;
    try {
        url = new URL(rawUrl);
    } catch (err) {
        throw err.code;
    }

    if (url.pathname === '/watch') {
        return [await Object.create(Song).from(rawUrl)];
    } else if (url.pathname === '/playlist') {
        videos = await ytpl(rawUrl);
        const songs = new Array(videos.items.length);
        await Promise.all(videos.items.map(async (item) => {
            const song = await Object.create(Song).from(item.shortUrl);
            songs[item.index - 1] = song;
        }));
        return songs;
    }
}

// helper function for connecting to voice channels
async function connectToChannel(channel) {
    const connection = voice.joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    return await voice.entersState(connection, voice.VoiceConnectionStatus.Ready, 30e3);
}

// helper function for creating and logging sent messages
async function sendMessage(message, text) {
    const guildCollection = await createFSGuildConnection('messages', message);

    try {
        const inMessage = guildCollection.doc(message.id);
        await inMessage.set({
            channelId: message.channelId,
            content: message.content,
        });
    } catch (err) {
        logger.error(err);
    }
    try {
        const sentMessage = await message.channel.send(text);
        const outMessage = guildCollection.doc(sentMessage.id);
        await outMessage.set({
            channelId: sentMessage.channelId,
            content: sentMessage.content,
        });
    } catch (err) {
        logger.error(err);
    }
}

// helper function that logs the given message into Firestore
async function logMessage(message) {
    const guildCollection = await createFSGuildConnection('messages', message);

    try {
        const messageDoc = guildCollection.doc(message.id);
        await messageDoc.set({
            channelId: message.channelId,
            content: message.content,
        });
    } catch (err) {
        logger.error('ERROR at logMessage():\n', err);
    }
}

async function createFSGuildConnection(collection, message) {
    const guildCollection = db.collection('guilds').doc(message.guildId);
    await guildCollection.set({ name: message.guild.name });
    
    return guildCollection.collection(collection);
}


// song module
var Song = {
    from: async function (url) {
        this.songInfo = await ytdl.getInfo(url);
        this.title = this.songInfo.videoDetails.title;
        this.url = this.songInfo.videoDetails.video_url;
        return this;
    },
    getAudioResource: function() {
        let stream = null;
        if (this.songInfo.videoDetails.isLive) {
            const format = ytdl.chooseFormat(this.songInfo.formats, { quality: [95,94,93] });
            stream = ytdl.downloadFromInfo(this.songInfo, format);
        } else {
            stream = ytdl.downloadFromInfo(this.songInfo, { filter: 'audioonly', highWaterMark: 1<<25 });
        }
        resource = voice.createAudioResource(stream, { inlineVolume: true });
        resource.volume.setVolume(0.2);
        return resource;
    }
}


client.login(BOT_TOKEN);