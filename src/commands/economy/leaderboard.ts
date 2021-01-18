/* eslint-disable camelcase */
import { Message, MessageEmbed } from 'discord.js';
import * as commando from 'discord.js-commando';
import { getUserBalance } from '../../db/balance';
import { CONFIG, rolePerms } from '../../globals';
import { checkRoles } from '../../utils/utils';

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

    const userInv = await getUserBalance(msg.guild.id);

    if (userInv === undefined) {
      // if there are no users return
      return msg.say('There seems to be a problem please contact the developer or staff');
    }

    const items = userInv.map((userBal) => userBal);

    items.sort((a, b) => b.balance - a.balance);

    if (items.length === 0) {
      return msg.say('There are no members with any money');
    }

    if (items === []) {
      return msg.say('There are no members with any money');
    }

    let i = 0;
    const embed = new MessageEmbed();
    embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }));
    embed.setTitle(`${msg.guild.name}'s Leaderboard`);
    embed.setFooter(`You can buy item with ${CONFIG.prefix}buy <item_name>`);
    items.forEach((item) => {
      i += 1;
      embed.addField(`${i}`, `**${item.username}**\n${item.balance} 🍩`, true);
    });
    // console.log(i);
    return msg.say(embed);
  }
}
