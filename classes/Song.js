const ytdl = require('@distube/ytdl-core');
const voice = require('@discordjs/voice');
const logger = require('../utils/bunyan').child({ module: 'classes/Song' });

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
        const log = logger.child({ fn: 'newSong' });
        log.debug({ url: newUrl }, 'Fetching song info');
        const songInfo = await ytdl.getInfo(newUrl);
        const title = songInfo.videoDetails.title;
        const url = songInfo.videoDetails.video_url;

        log.info(`Created song '${title}'`);
        return new Song(songInfo, title, url);
    }

    getAudioResource(startTime = 0) {
        const log = logger.child({ fn: 'getAudioResource' });
        let stream = null;
    
        log.debug({ startTime }, 'Creating audio resource');
        if (this.songInfo.videoDetails.isLive) {
            // Grab best audio format available for live streams
            const format = ytdl.chooseFormat(this.songInfo.formats, { 
                filter: 'audioonly' 
            });
    
            if (!format || !format.url) {
                throw new Error('No valid audio format found for livestream');
            }
    
            stream = ytdl.downloadFromInfo(this.songInfo, {
                format,
                highWaterMark: 1 << 25,
                liveBuffer: 4000, // helps with livestream buffering
                dlChunkSize: 0,
                begin: `${Math.floor(startTime)}ms`
            });
        } else {
            stream = ytdl.downloadFromInfo(this.songInfo, {
                filter: 'audioonly',
                highWaterMark: 1 << 25,
                begin: `${Math.floor(startTime)}ms`
            });
        }
    
        const resource = voice.createAudioResource(stream, {
            inputType: voice.StreamType.Arbitrary,
            inlineVolume: true
        });
        resource.volume.setVolume(0.2);
        log.debug('Audio resource created');
        return resource;
    }
    
}

