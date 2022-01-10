const Discord = require('discord.js');
const voice = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');

require('dotenv').config();

const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'] });

const queue = new Map();


client.once('ready', () => {
    console.log(`Ready! Logged in as ${client.user.username}`);
});

// handles commands to bot
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(process.env.PREFIX)) return;

    const serverQueue = queue.get(message.guild.id);
    
    const args = message.content.slice(1).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'play' || command === 'p') {
        if (args.length === 0) {
            return message.channel.send('Please include a Youtube link after the !play command');
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
            return message.channel.send('Please include a Youtube link after the !playskip command');
        }
        playSkip(message, args, serverQueue);
        return;
    }
});


// primary function, handles adding songs to queue
async function execute(message, args, serverQueue) {
    // get users voice channel
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.channel.send('You need to be in a voice channel!');
    }
    
    // check if we have needed permissions
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return message.channel.send('I need permissions to join and speak in your voice channel!');
    }

    // create song from youtube link
    const songs = await createSongsFromUrl(args[0]);
    const audioPlayer = voice.createAudioPlayer();

    // create a new song queue for guild
    if (!serverQueue) {
        const queueConstruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            audioPlayer: audioPlayer,
            songs: [],
            currentSong: null,
        };

        queue.set(message.guild.id, queueConstruct);
        songs.forEach(song => {
            queueConstruct.songs.push(song);
        });

        try {
            await connectToChannel(voiceChannel);
            play(message.guild, queueConstruct.songs.shift());
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
        }
    }
    // song queue already exists, add new song to end of queue
    else {
        serverQueue.songs.push(song);
        return message.channel.send(`**${song.title}** has been added to the queue`);
    }
}

// removes current queue and plays the given song
async function playSkip(message, args, serverQueue) {
    if (!message.member.voice.channel) {
        return message.channel.send('You need to be in a voice channel to play tracks!');
    }
    if (serverQueue) {
        serverQueue.songs = [];
        const songs = await createSongsFromUrl(args[0]);
        songs.forEach(song => {
            serverQueue.songs.push(song);
        });
        play(message.guild, serverQueue.songs.shift());
        return message.channel.send(`Now playing: **${song.title}**`);
    } else {
        execute(message, args, serverQueue);
    }
}

// skip songs
function skip(message, serverQueue) {
    if (!message.member.voice.channel) {
        return message.channel.send('You need to be in a voice channel to skip tracks!');
    }
    if (serverQueue) {
        play(message.guild, serverQueue.songs.shift());
    }
}

// stop player and clear queue
function stop(message, serverQueue) {
    if (!message.member.voice.channel) {
        return message.channel.send('You need to be in a voice channel to stop the music!');
    }
    if (serverQueue) {
        serverQueue.connection.destroy();
        queue.delete(message.guild.id);
    }
}

// show the songs currently in queue
function showQueue(message, serverQueue) {
    if (!message.member.voice.channel) {
        return message.channel.send('You need to be in a voice channel to view the queue!');
    }
    if (serverQueue) {
        songQueue = `\`\`\`Currently playing: **${serverQueue.currentSong.title}**`;
        if (serverQueue.songs.length > 0) {
            songQueue += '\n\nUp next:';
            serverQueue.songs.forEach(song => {
                songQueue += `\n**${song.title}**`;
            });
        }
        return message.channel.send(songQueue + '\`\`\`');
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

    try {
        const resource = song.getAudioResource();
        serverQueue.audioPlayer.play(resource);
        const subscription = connection.subscribe(serverQueue.audioPlayer);
        
        if (subscription) {
            console.log(resource);
            serverQueue.textChannel.send(`Now playing: **${song.title}**`);

            serverQueue.audioPlayer.on('error', error => {
                console.error(`Error: ${error.message} with resource ${error.resource}`);
            });
            serverQueue.audioPlayer.on(voice.AudioPlayerStatus.Idle, (oldState, newState) => {
                play(guild, serverQueue.songs.shift());
            })
        }
    } catch (err) {
        console.error(err);
        play(guild, serverQueue.songs.shift());
    }
}

// helper function for getting youtube video urls
async function createSongsFromUrl(rawUrl) {
    const url = new URL(rawUrl);
    let songs = []
    if (url.pathname === '/watch') {
        songs.push(await Object.create(Song).from(rawUrl));
        return songs;
    } else if (url.pathname === '/playlist') {
        videos = await ytpl(rawUrl);
        for (const item of videos.items) {
            let song = await Object.create(Song).from(item.shortUrl);
            songs.push(song);
        }
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

// song module
var Song = {
    from: async function (url) {
        this.songInfo = await ytdl.getInfo(url);
        this.title = this.songInfo.videoDetails.title;
        this.url = this.songInfo.videoDetails.video_url;
        return this;
    },
    getAudioResource: function() {
        const stream = ytdl.downloadFromInfo(this.songInfo, { filter: 'audioonly' }, { quality: '94' });
        resource = voice.createAudioResource(stream, { inlineVolume: true });
        resource.volume.setVolume(0.2);
        return resource;
    }
}


client.login(process.env.BOT_TOKEN);