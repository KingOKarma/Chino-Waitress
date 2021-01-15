/* eslint-disable camelcase */
import * as commando from 'discord.js-commando';
import {
} from '../../utils/roles';
import { Message } from 'discord.js';
import { CONFIG, rolePerms } from '../../globals';
import { addServerShopItem, getServerShop } from '../../db/shop';

export default class colourListCommand extends commando.Command {
  constructor(client: commando.CommandoClient) {
    super(client, {
      name: 'shopadd',
      aliases: ['itemadd', 'newitem'],
      group: 'staff',
      memberName: 'shopadd',
      description: 'Adds a new item to the server shop',
      clientPermissions: rolePerms,
      userPermissions: rolePerms,
      throttling: {
        usages: 3,
        duration: 5,
      },
      guildOnly: true,
      args: [
        {
          key: 'item_name',
          prompt: 'The name of the new item ',
          type: 'string',
          default: '',
          validate: (text: string) => text.length < 21,
          error: 'Try not to use special characters (max length 20 characters)',
        },
        {
          key: 'price',
          prompt: 'How much does the item cost?',
          type: 'integer',
          default: '1000000',
          error: 'Please only use a number for the price',
        },
        {
          key: 'item_desc',
          prompt: 'What is the description of the item (max length 100 characters)',
          type: 'string',
          default: 'item_desc',
          validate: (text: string) => text.length < 101,
          error: 'Try not to use special characters (max length 100 characters)',

        },
      ],
    });
  }

  public async run(
    msg: commando.CommandoMessage,
    { item_name, price, item_desc }: {
         item_name: string,
          price: number,
           item_desc: string
         },
  ): Promise<Message | Message[]> {
    const shopItem = await getServerShop(msg.guild.id);

    if (shopItem === undefined) {
      // if there are no users return
      return msg.say('There seems to be a problem please contact the developer or staff');
    }

    if (item_name === '') {
      return msg.say('Please don\'t leave the `item_name` blank,\ncommand usage: '
      + `${CONFIG.prefix}shopadd \`<item_name> <price> <item_description>\``);
    }

    const itemDB = shopItem.find((item) => item.item_name === item_name);

    if (itemDB === undefined) {
      console.log('A new item has been made!');
    } else if (itemDB.item_name) {
      return msg.say(`\`${item_name}\` already exists on the shop! please name it something else!`);
    }
    addServerShopItem(msg.author, msg.guild.id, item_name, item_desc, price);

    return msg.say(`I have added \`${item_name}\` to the shop`);
  }
}
