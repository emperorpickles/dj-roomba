const ytpl = require('ytpl');
const Song = require('../classes/Song');

module.exports = {
    async createSongsFromUrl(newUrl) {
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
    }
};