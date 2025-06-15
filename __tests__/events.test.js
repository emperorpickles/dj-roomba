jest.mock('../utils/bunyan');
const ready = require('../events/ready');
const interactionCreate = require('../events/interactionCreate');
const logger = require('../utils/bunyan');

describe('events modules', () => {
  test('ready logs info', () => {
    ready.execute({ user: { tag: 'bot' } });
    expect(logger.info).toHaveBeenCalled();
  });

  test('interactionCreate handles command', async () => {
    const fakeCommand = { execute: jest.fn() };
    const interaction = {
      isChatInputCommand: () => true,
      commandName: 'test',
      client: { commands: new Map([['test', fakeCommand]]) }
    };
    await interactionCreate.execute(interaction);
    expect(fakeCommand.execute).toHaveBeenCalled();
  });
});
