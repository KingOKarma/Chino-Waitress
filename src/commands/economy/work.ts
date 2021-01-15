import { Message, MessageEmbed } from 'discord.js';
import * as commando from 'discord.js-commando';
import ms from 'ms';
import { getUserBalance, updateUserBalance } from '../../db/balance';
import { CONFIG, rolePerms } from '../../globals';
import { checkRoles } from '../../utils/utils';

const Timeout = new Map();

// Creates a new class (being the command) extending off of the commando client
export default class UserInfoCommand extends commando.Command {
  constructor(client: commando.CommandoClient) {
    super(client, {
      name: 'work',
      // Creates aliases
      // This is the group the command is put in
      group: 'economy',
      // This is the name of set within the group (most people keep this the same)
      memberName: 'work',
      description: 'Work to earn money',
      // Ratelimits the command usage to 3 every 5 seconds
      throttling: {
        usages: 3,
        duration: 5,
      },
      // Makes commands only avalabie within the guild
      guildOnly: true,
      // Require's bot to have MANAGE_MESSAGES perms
      clientPermissions: rolePerms,
    });
  }

  // Now to run the actual command, the run() parameters need to be defiend (by types and names)
  public async run(
    msg: commando.CommandoMessage,
  ): Promise<Message | Message[]> {
    const perms = checkRoles(msg.member, CONFIG.allowedRoles);

    if (!perms) {
      return msg.say(`You do not have permission to use this command ${msg.member},\n`
        + `use \`${CONFIG.prefix}booster list\` to check who can use the command!`);
    }

    const balance = await getUserBalance(msg.guild.id);

    if (balance === undefined) {
      // if there are no users return
      return msg.say('There seems to be a problem please contact the developer or staff');
    }

    const userDb = balance.find((user) => user.uid === msg.author.id);

    const embed = new MessageEmbed();
    if (userDb === undefined) {
      // if there are no users return
      return msg.say('You have no money stored, You may not be a booster for the server');
    }

    const plusBal = Math.floor((Math.random() * 275) + 25);
    const timeout = 43200 * 1000;
    const key = `${msg.author.id}work`;
    const found = Timeout.get(key);

    if (found && msg.author.id !== '406211463125008386') {
      const timePassed = Date.now() - found;
      const timeLeft = timeout - timePassed;
      return msg.say(`**Slow down worker, you can work again in ${ms(timeLeft)}!**`);
    }

    let userBalance = userDb.balance;

    userBalance += plusBal;

    const Hours = 43200;

    const newBal = Math.round(userBalance);
    updateUserBalance(
      {
        username: msg.author.tag,
        uid: msg.author.id,
        guild_id: msg.guild.id,
        balance: newBal,
      },
    );
    Timeout.set(key, Date.now());

    setTimeout(() => {
      Timeout.delete(key);
      // 12 hours
    }, Hours * 1000);

    let response = CONFIG.workResponses[Math.floor(Math.random() * CONFIG.workResponses.length)];

    const bal = `**${plusBal}🍩**`;

    if (response.includes('{bal}')) {
      const replace = new RegExp('{bal}', 'g');
      response = response.replace(replace, bal);
    }

    embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }));
    embed.setTitle('Working Hours');
    embed.setDescription(response);
    embed.setFooter('Donuts Currency is only available for server boosters!');
    return msg.say(embed);
  }
}
