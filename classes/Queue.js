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
}