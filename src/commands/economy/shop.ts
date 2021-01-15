/* eslint-disable camelcase */
import { Message, MessageEmbed } from 'discord.js';
import * as commando from 'discord.js-commando';
import { getServerShop } from '../../db/shop';
import { CONFIG, rolePerms } from '../../globals';

// Creates a new class (being the command) extending off of the commando client
export default class UserInfoCommand extends commando.Command {
  constructor(client: commando.CommandoClient) {
    super(client, {
      name: 'shop',
      // Creates aliases
      aliases: ['market'],
      // This is the group the command is put in
      group: 'economy',
      // This is the name of set within the group (most people keep this the same)
      memberName: 'shop',
      description: 'Lists the server shop/buys from the server shop!',
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
    const shopItem = await getServerShop(msg.guild.id);

    if (shopItem === undefined) {
      // if there are no users return
      return msg.say('There seems to be a problem please contact the developer or staff');
    }

    const items = shopItem.map((itemName) => itemName);

    if (items.length === 0) {
      return msg.say('The shop is empty right now, please come back later!');
    }

    let i = 0;
    const embed = new MessageEmbed();
    embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }));
    embed.setTitle('Shop');
    embed.setFooter(`You can buy item with ${CONFIG.prefix}buy <item_name>`);
    items.forEach((item) => {
      i += 1;
      embed.addField(`Price: ${item.price} 🍩\n${item.item_name}`, `${item.item_desc}\n Added by <@${item.uid}> `);
    });
    console.log(i);
    return msg.say(embed);
  }
}
