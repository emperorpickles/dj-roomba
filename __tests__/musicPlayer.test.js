const mockQueue = { songs: [], currentSong: null };
jest.mock('../handlers/guilds', () => ({
  getQueue: jest.fn(() => mockQueue),
  getAudioPlayer: jest.fn(() => ({ play: jest.fn(), on: jest.fn() })),
  createVoiceConnection: jest.fn(),
  getGuildVoiceConnection: jest.fn(() => ({ subscribe: jest.fn() })),
  destroyVoiceConnection: jest.fn(),
}));
jest.mock('../utils/bunyan');
const guilds = require('../handlers/guilds');
const player = require('../handlers/musicPlayer');

describe('musicPlayer handler', () => {
  beforeEach(() => {
    mockQueue.songs = [];
    mockQueue.currentSong = null;
  });
  test('addSongToQueue adds songs and sets currentSong', () => {
    const interaction = { guild: { name: 'g1' } };
    const songs = [{ title: 't1' }, { title: 't2' }];
    const result = player.addSongToQueue(interaction, songs);
    const guildQueue = guilds.getQueue();
    expect(guildQueue.songs.length).toBe(1);
    expect(guildQueue.currentSong).toEqual(songs[0]);
    expect(result).toContain('t1');
  });

  test('getSongQueueString returns string', () => {
    const str = player.getSongQueueString({ songs: [{ title: 'a' }, { title: 'b' }] });
    expect(str).toContain('a');
    expect(str).toContain('b');
  });
});
