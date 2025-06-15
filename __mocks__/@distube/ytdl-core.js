module.exports = {
  getInfo: jest.fn(async (url) => ({
    videoDetails: { title: 'Mock Title', video_url: url, isLive: false },
    formats: []
  })),
  chooseFormat: jest.fn(() => ({ url: 'format-url' })),
  downloadFromInfo: jest.fn(() => 'stream'),
};
