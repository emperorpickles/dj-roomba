jest.mock('@distube/ytdl-core');
jest.mock('@discordjs/voice');
const Song = require('../classes/Song');
const ytdl = require('@distube/ytdl-core');

describe('Song', () => {
  test('newSong creates song with title and url', async () => {
    const song = await Song.newSong('http://example.com');
    expect(ytdl.getInfo).toHaveBeenCalled();
    expect(song.title).toBe('Mock Title');
    expect(song.url).toBe('http://example.com');
  });
});
