/* eslint-disable camelcase */
import { Message, MessageEmbed } from 'discord.js';
import * as commando from 'discord.js-commando';
import { getUserBalance } from '../../db/balance';
import { CONFIG, rolePerms } from '../../globals';
import { UserCurrency } from '../../models/types';
import { checkRoles, paginate } from '../../utils/utils';

// Creates a new class (being the command) extending off of the commando client
export default class UserInfoCommand extends commando.Command {
  constructor(client: commando.CommandoClient) {
    super(client, {
      name: 'leaderboard',
      // Creates aliases
      aliases: ['lb'],
      // This is the group the command is put in
      group: 'economy',
      // This is the name of set within the group (most people keep this the same)
      memberName: 'leaderboard',
      description: 'Lists the servers leaderboard for currency',
      // Ratelimits the command usage to 3 every 5 seconds
      throttling: {
        usages: 3,
        duration: 5,
      },
      args: [
        {
          key: 'page',
          type: 'integer',
          prompt: 'What positiion are you looking for (number)',
          default: '1',
          validate: (amount: number) => amount >= 0,
          error: 'Please only use a number for the page',
        },
      ],
      // Makes commands only avalabie within the guild
      guildOnly: true,
      // Require's bot to have MANAGE_MESSAGES perms
      clientPermissions: rolePerms,
    });
  }

  // Now to run the actual command, the run() parameters need to be defiend (by types and names)
  public async run(
    msg: commando.CommandoMessage,
    { page }: { page: number },
  ): Promise<Message | Message[]> {
    const perms = checkRoles(msg.member, CONFIG.allowedRoles);

    if (!perms) {
      return msg.say(`You do not have permission to use this command ${msg.member},\n`
        + `use \`${CONFIG.prefix}booster list\` to check who can use the command!`);
    }

    const userInv = await getUserBalance(msg.guild.id);

    if (userInv === undefined) {
      // if there are no users return
      return msg.say('There seems to be a problem please contact the developer or staff');
    }

    const userDb = userInv.find((user) => user.uid === msg.author.id);

    if (userDb === undefined) {
      // if there are no users return
      return msg.say('You have no money stored, You may not be a booster for the server');
    }

    const items = userInv.map((userBal) => userBal);

    items.sort((a, b) => b.balance - a.balance);

    items.forEach((users, index) => {
      // eslint-disable-next-line no-param-reassign
      users.username = `${index + 1} || ${users.username}`;
    });

    const IteamsPaged: UserCurrency[] = paginate(items, 12, page);

    if (IteamsPaged.length === 0) {
      return msg.say('There are no members with any money');
    }

    if (IteamsPaged === []) {
      return msg.say('There are no members with any money');
    }

    const authorPost = items.find((user) => user.uid === msg.author.id);

    if (authorPost === undefined) {
      return msg.say('You\'re not on the database, try again when you have some money!');
    }

    const embed = new MessageEmbed();
    embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }));
    embed.setTitle(`${msg.guild.name}'s Leaderboard`);
    embed.setDescription(`You are in position: **${authorPost.username}**\n You have \`${userDb.balance}\`🍩`);
    embed.setFooter(`You can find the next page with ${CONFIG.prefix}lb <page_number>`);
    IteamsPaged.forEach(async (item: UserCurrency) => {
      // item.index
      embed.addField(`${item.username}`, `${item.balance} 🍩`, true);
    });
    return msg.say(embed);
  }
}
