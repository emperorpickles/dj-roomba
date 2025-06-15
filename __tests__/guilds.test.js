jest.mock('@discordjs/voice');
jest.mock('../classes/Queue', () => ({ newQueue: jest.fn(() => ({ interaction: 'i', songs: [], currentSong: null })) }));
jest.mock('../index');

const guilds = require('../handlers/guilds');
const Queue = require('../classes/Queue');
const index = require('../index');
const { joinVoiceChannel } = require('@discordjs/voice');

describe('guilds handler', () => {
  beforeEach(() => {
    index.client.guildQueues.clear();
  });

  test('getQueue creates a new queue when missing', () => {
    const interaction = { guildId: '123', member: { voice: {} }, guild: { name: 'g' } };
    const q = guilds.getQueue(interaction);
    expect(Queue.newQueue).toHaveBeenCalled();
    expect(index.client.guildQueues.get('123')).toBe(q);
  });

  test('createVoiceConnection joins VC', async () => {
    const interaction = { member: { voice: { channelId: '1', channel: { name: 'VC' } } }, guildId: 'g1', guild: { name: 'g', voiceAdapterCreator: {} } };
    await guilds.createVoiceConnection(interaction);
    expect(joinVoiceChannel).toHaveBeenCalled();
  });
});
