jest.mock('../index');
jest.mock('discord.js', () => {
  class SlashCommandBuilder {
    constructor() { this.name=''; this.description=''; }
    setName(n){ this.name=n; return this; }
    setDescription(d){ this.description=d; return this; }
    addStringOption(){ return this; }
  }
  return { SlashCommandBuilder };
}, { virtual: true });
const fs = require('fs');
const path = require('path');

describe('command modules export data and execute', () => {
  const cmdDir = path.join(__dirname, '..', 'commands');
  fs.readdirSync(cmdDir).forEach(file => {
    test(`${file} has data and execute`, () => {
      jest.isolateModules(() => {
        jest.doMock('discord.js');
        const cmd = require(path.join(cmdDir, file));
        expect(cmd).toHaveProperty('data');
        expect(typeof cmd.execute).toBe('function');
      });
    });
  });
});
