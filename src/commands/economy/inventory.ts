import * as commando from 'discord.js-commando';
import { Message, MessageEmbed } from 'discord.js';
import { getRepository } from 'typeorm';
import { Guild } from '../../entity/guild';
import { Inventory } from '../../entity/inventory';
import { ItemMeta } from '../../entity/item';
import { checkRoles, stringpaginate } from '../../bot/utils/utils';
import { CONFIG } from '../../bot/globals';

export default class InventoryCommand extends commando.Command {
  private constructor(client: commando.CommandoClient) {
    super(client, {
      aliases: ['inv', 'iv'],
      args: [
        {
          default: '1',
          error: 'Please only use a number for the page',
          key: 'page',
          prompt: 'What positiion are you looking for (number)',
          type: 'integer',
          validate: (amount: number): boolean => amount >= 0,
        },
      ],
      clientPermissions: ['EMBED_LINKS'],
      description: "Display's your user's inventory",
      group: 'economy',
      guildOnly: true,
      memberName: 'inventory',
      name: 'inventory',
      throttling: {
        duration: 3,
        usages: 3,
      },
    });
  }

  public async run(
    msg: commando.CommandoMessage,
    { page }: { page: number; },
  ): Promise<Message | Message[]> {
    const perms = checkRoles(msg.member, CONFIG.allowedRoles);
    if (!perms) {
      return msg.say(`You do not have permission to use this command ${msg.member},\n`
        + `use \`${CONFIG.prefix}booster list\` to check who can use the command!`);
    }

    const invRepo = getRepository(Inventory);
    const itemsRepo = getRepository(ItemMeta);
    const guildRepo = getRepository(Guild);

    if (msg.guild === null) {
      return msg.say('Sorry there was a problem please try again');
    }

    const guild = await guildRepo.findOne({ serverid: msg.guild.id });

    const itemList = await invRepo.findOne({ serverid: msg.guild.id, uid: msg.author.id });

    if (!itemList) {
      return msg.say('You have no items in your inventory, you can buy them from the server shop!');
    }

    if (!guild) {
      return msg.say('A shop has not been setup in this server, please ask a server manager to do so');
    }

    const iteamsPaged: string[] = stringpaginate(itemList.items, 9, page);

    if (iteamsPaged.length === 0) {
      return msg.say('There are no items on that page');
    }

    let guildicon = msg.guild.iconURL({ dynamic: true });
    if (guildicon === null) {
      guildicon = '';
    }

    const embed = new MessageEmbed();

    // eslint-disable-next-line no-restricted-syntax
    for (const item of iteamsPaged) {
      // eslint-disable-next-line no-await-in-loop
      const itemInfo = await itemsRepo.findOne({ guild, name: item });
      if (!itemInfo) {
        return msg.say('An item in the server could not be found');
      }
      embed.addField(`${item}`, itemInfo.description);
    }

    embed.setColor('BLUE');
    embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }));
    embed.setTitle('Inventory');
    embed.setFooter("If there is a problem with an item please report it's ID number to the dev");
    embed.setThumbnail(guildicon);

    return msg.channel.send(embed);
  }
}
