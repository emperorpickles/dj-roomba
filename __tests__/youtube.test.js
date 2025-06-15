jest.mock('ytpl');
jest.mock('youtube-sr');
jest.mock('../classes/Song', () => ({ newSong: jest.fn(async (url) => ({ title: `song-${url}`, url })) }));

const youtube = require('../handlers/youtube');
const ytpl = require('ytpl');
const youtubeSr = require('youtube-sr');
const Song = require('../classes/Song');

describe('youtube handler', () => {
  test('createSongsFromUrl with watch url', async () => {
    const songs = await youtube.createSongsFromUrl('https://www.youtube.com/watch?v=123');
    expect(Song.newSong).toHaveBeenCalled();
    expect(songs[0].title).toBe('song-https://www.youtube.com/watch?v=123');
  });

  test('createSongsFromUrl with playlist', async () => {
    const songs = await youtube.createSongsFromUrl('https://youtube.com/playlist?list=123');
    expect(ytpl).toHaveBeenCalled();
    expect(songs.length).toBe(2);
  });

  test('search returns songs', async () => {
    const songs = await youtube.search('test');
    expect(youtubeSr.default.search).toHaveBeenCalled();
    expect(songs[0].title).toBe('song-searchUrl1');
  });
});
