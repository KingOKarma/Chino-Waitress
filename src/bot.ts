import { Client } from 'discord.js-commando';
import path from 'path';
import { onMemberUpdate, onMessage, onReady } from './events';
import { CONFIG } from './globals';

async function main() {
  const bot = new Client({
  // My choses prefix is "c." you can choose anything you want!
    commandPrefix: CONFIG.prefix,
    owner: CONFIG.owners,

  });

  // Runs the function defined in ./events
  bot.on('ready', () => onReady(bot));

  bot.on('guildMemberUpdate', onMemberUpdate);

  bot.on('message', onMessage);

  // registers all groups/commands/etc
  bot.registry.registerGroups([
    ['boosters'],
    ['staff'],
    ['economy'],
  ]).registerDefaults()
    .registerCommandsIn(
      path.join(__dirname, 'commands'),
    );

  await bot.login(CONFIG.token);
}

main().catch(console.error);
