class MockAudioPlayer { constructor(){ this.play=jest.fn(); this.on=jest.fn(); }}
module.exports = {
  createAudioPlayer: jest.fn(() => new MockAudioPlayer()),
  joinVoiceChannel: jest.fn(() => ({ on: jest.fn() })),
  getVoiceConnection: jest.fn(() => null),
  createAudioResource: jest.fn(() => ({ volume: { setVolume: jest.fn() } })),
  VoiceConnectionStatus: { Ready: 'ready' },
  AudioPlayerStatus: { Idle: 'idle' },
  StreamType: { Arbitrary: 'arbitrary' },
};
