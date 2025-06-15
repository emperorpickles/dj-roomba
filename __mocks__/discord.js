class SlashCommandBuilder {
  constructor() { this.name=''; this.description=''; }
  setName(n){ this.name=n; return this; }
  setDescription(d){ this.description=d; return this; }
  addStringOption(){ return this; }
}
class Collection extends Map {}
class InteractionCollector {}
const Events = { InteractionCreate: 'interactionCreate', ClientReady: 'ready' };
module.exports = { SlashCommandBuilder, Collection, InteractionCollector, Events };
