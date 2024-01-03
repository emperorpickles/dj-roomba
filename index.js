const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { generateDependencyReport } = require('@discordjs/voice')
const voice = require('@discordjs/voice');
const Firestore = require('@google-cloud/firestore');

const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const { YouTube, Video, Playlist } = require('youtube-sr');

const logger = require('./utils/bunyan');

// environment variables
require('dotenv').config();
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent]
});
client.guildQueues = new Collection();

// establish Firestore db connection
const db = new Firestore({
    projectId: GCP_PROJECT_ID,
})

// slash command handler
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // set a new item in the Collection with command name as the key and the exported module as the value
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        logger.info(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// events handler
const eventsPath = path.join(__dirname, 'events');
const eventsFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventsFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

module.exports.client = client;

client.login(BOT_TOKEN);


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