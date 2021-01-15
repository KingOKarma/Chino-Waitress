/* eslint-disable camelcase */
import * as commando from 'discord.js-commando';
import {
} from '../../utils/roles';
import { Message } from 'discord.js';
import { rolePerms } from '../../globals';
import { deleteItemFromShop, getServerShop } from '../../db/shop';

export default class colourListCommand extends commando.Command {
  constructor(client: commando.CommandoClient) {
    super(client, {
      name: 'shopremove',
      aliases: ['shopdel', 'shopdelete'],
      group: 'staff',
      memberName: 'shopremove',
      description: 'Removes an item from the server shop',
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
          default: ' ',
          validate: (text: string) => text.length < 21,
          error: 'Try not to use special characters (max length 20 characters)',
        },
      ],
    });
  }

  public async run(
    msg: commando.CommandoMessage,
    { item_name }: {
         item_name: string,
         },
  ): Promise<Message | Message[]> {
    const shopItem = await getServerShop(msg.guild.id);

    if (shopItem === undefined) {
      // if there are no users return
      return msg.say('There seems to be a problem please contact the developer or staff');
    }

    const itemDB = shopItem.find((item) => item.item_name === item_name);

    if (itemDB === undefined) {
      return msg.say(`\`${item_name}\` does not exist!`);
    }
    deleteItemFromShop(item_name);

    return msg.say(`I have removed \`${item_name}\` from the shop`);
  }
}
