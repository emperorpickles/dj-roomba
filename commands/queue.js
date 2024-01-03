const { SlashCommandBuilder } = require('discord.js');
const player = require('../handlers/musicPlayer');
const index = require('../index');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Displays the current song queue.'),
    async execute(interaction) {
        const guildQueue = index.client.guildQueues.get(interaction.guildId);
        const queue = player.getSongQueueString(guildQueue);

        await interaction.reply(`\`\`\`Currently playing: ${guildQueue.currentSong.title}\nCurrent queue:${queue}\`\`\``);
    },
};