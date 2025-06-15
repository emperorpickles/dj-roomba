const ytpl = require('ytpl');
const youtube_sr = require('youtube-sr').default;
const logger = require('../utils/bunyan');
const Song = require('../classes/Song');

async function createSongsFromUrl(newUrl) {
    let url = null;
    try {
        url = new URL(newUrl);
    } catch (err) {
        throw err.code;
    }

    if (url.pathname === '/watch') {
        return [await Song.newSong(newUrl)];
    } else if (url.pathname === '/playlist') {
        videos = await ytpl(newUrl);
        const songs = new Array(videos.items.length);
        await Promise.all(videos.items.map(async (item) => {
            const song = await Song.newSong(item.shortUrl);
            songs[item.index - 1] = song;
        }));
        return songs;
    }
};

async function search(searchTerm) {
    const videos = await youtube_sr.search(searchTerm, { limit: 5 });
    logger.debug(videos);
    const songs = new Array(videos.length);
    await Promise.all(videos.map(async (item) => {
        const song = await Song.newSong(item.url);
        songs[item.index - 1] = song;
    }));
    return songs;
}

// createSongsFromUrl - takes a YouTube URL and returns an array of Song objects
// search - takes a search term and returns an array of Song objects
module.exports = {
    createSongsFromUrl,
    search,
};