const ytdl = require('ytdl-core');
const voice = require('@discordjs/voice');

module.exports = class Song {
    constructor(songInfo, title, url) {
        this.songInfo = songInfo;
        this.title = title;
        this.url = url;
        this.resource = this.getAudioResource();
    }

    get songInfo() {
        return this._songInfo;
    }
    set songInfo(newSongInfo) {
        this._songInfo = newSongInfo;
    }

    get title() {
        return this._title;
    }
    set title(newTitle) {
        this._title = newTitle;
    }

    get url() {
        return this._url;
    }
    set url(newUrl) {
        this._url = newUrl;
    }

    get resource() {
        return this._resource;
    }
    set resource(newResource) {
        this._resource = newResource;
    }

    static async newSong(newUrl) {
        const songInfo = await ytdl.getInfo(newUrl);
        const title = songInfo.videoDetails.title;
        const url = songInfo.videoDetails.video_url;

        return new Song(songInfo, title, url);
    }

    getAudioResource() {
        let stream = null;
        if (this.songInfo.videoDetails.isLive) {
            const format = ytdl.chooseFormat(this.songInfo.formats, { quality: [95,94,93] });
            stream = ytdl.downloadFromInfo(this.songInfo, format);
        } else {
            stream = ytdl.downloadFromInfo(this.songInfo, { filter: 'audioonly', highWaterMark: 1<<25 });
        }
        const resource = voice.createAudioResource(stream, { inlineVolume: true });
        resource.volume.setVolume(0.2);
        return resource;
    }
}