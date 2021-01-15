/* eslint-disable camelcase */
import { Message, MessageEmbed } from 'discord.js';
import * as commando from 'discord.js-commando';
import { getUserInvetory } from '../../db/inventory';
import { CONFIG, rolePerms } from '../../globals';

// Creates a new class (being the command) extending off of the commando client
export default class UserInfoCommand extends commando.Command {
  constructor(client: commando.CommandoClient) {
    super(client, {
      name: 'inventory',
      // Creates aliases
      aliases: ['inv'],
      // This is the group the command is put in
      group: 'economy',
      // This is the name of set within the group (most people keep this the same)
      memberName: 'inventory',
      description: 'Lists the items in a user\'s inventory!',
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
    const userInv = await getUserInvetory(msg.guild.id);

    if (userInv === undefined) {
      // if there are no users return
      return msg.say('There seems to be a problem please contact the developer or staff');
    }

    const items = userInv.map((itemName) => itemName.item_list);

    if (items.length === 0) {
      return msg.say('You have 0 items, you can buy them from the shop with 🍩 Donuts');
    }

    if (items === []) {
      return msg.say('You have 0 items, you can buy them from the shop with 🍩 Donuts');
    }

    // let i = 0;
    const embed = new MessageEmbed();
    embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }));
    embed.setTitle(`${msg.author.tag}'s Inventory`);
    embed.setFooter(`You can buy item with ${CONFIG.prefix}buy <item_name>`);
    items.forEach((item) => {
      // i += 1;
      embed.addField('Item\'s', `Your items:\n${item.join(' `|` ')}`);
    });
    // console.log(i);
    return msg.say(embed);
  }
}
