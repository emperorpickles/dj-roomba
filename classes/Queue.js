module.exports = class Queue {
    constructor(interaction, audioPlayer = null, songs = [], currentSong = null) {
        this.interaction = interaction,
        this.audioPlayer = audioPlayer,
        this.songs = songs,
        this.currentSong = currentSong
    }
}