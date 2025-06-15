jest.mock('@discordjs/voice');
const Queue = require('../classes/Queue');
const { createAudioPlayer } = require('@discordjs/voice');

describe('Queue', () => {
  test('newQueue creates queue with defaults', () => {
    const interaction = { id: '1' };
    const q = Queue.newQueue(interaction);
    expect(createAudioPlayer).toHaveBeenCalled();
    expect(q.interaction).toBe(interaction);
    expect(q.songs).toEqual([]);
    expect(q.currentSong).toBeNull();
  });
});
