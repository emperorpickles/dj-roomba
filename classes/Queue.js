const { createAudioPlayer } = require('@discordjs/voice');
const logger = require('../utils/bunyan').child({ module: 'classes/Queue' });

module.exports = class Queue {
    constructor(interaction, audioPlayer = null, songs = [], currentSong = null) {
        this.interaction = interaction,
        this.audioPlayer = audioPlayer,
        this.songs = songs,
        this.currentSong = currentSong
    }

    get interaction() {
        return this._interaction;
    }
    set interaction(newInteraction) {
        this._interaction = newInteraction;
    }

    get audioPlayer() {
        return this._audioPlayer;
    }
    set audioPlayer(newAudioPlayer) {
        this._audioPlayer = newAudioPlayer;
    }

    get songs() {
        return this._songs;
    }
    set songs(newSongs) {
        this._songs = newSongs;
    }

    get currentSong() {
        return this._currentSong;
    }
    set currentSong(newCurrentSong) {
        this._currentSong = newCurrentSong;
    }

    static newQueue(interaction) {
        const log = logger.child({ fn: 'newQueue' });
        const audioPlayer = createAudioPlayer();
        const songs = [];
        const currentSong = null;

        log.info(`Created new queue for guild ${interaction.guildId}`);
        return new Queue(interaction, audioPlayer, songs, currentSong);
    }
}

