module.exports = {
  default: {
    search: jest.fn(async () => [
      { url: 'searchUrl1', index: 1, title: 'Found 1' },
      { url: 'searchUrl2', index: 2, title: 'Found 2' }
    ])
  }
};
