const ytdl = require('ytdl-core');

module.exports = class Song {
    constructor(songInfo, title, url) {
        this.songInfo = songInfo;
        this.title = title;
        this.url = url;
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
            stream = ytdl.downloadFromInfo(this.songInfo, { filter: 'audioonly' });
        }
        resource = voice.createAudioResource(stream, { inlineVolume: true });
        resource.volume.setVolume(0.2);
        return resource;
    }
}