/* eslint-disable camelcase */
import * as commando from 'discord.js-commando';
import {
} from '../../utils/roles';
import { Message } from 'discord.js';
import { rolePerms } from '../../globals';
import { getServerShop } from '../../db/shop';
import { getMember } from '../../utils/utils';
import { getUserInvetory, updateUserInvetory } from '../../db/inventory';

export default class colourListCommand extends commando.Command {
  constructor(client: commando.CommandoClient) {
    super(client, {
      name: 'invremove',
      aliases: ['invdel'],
      group: 'staff',
      memberName: 'invremove',
      description: 'Removes an item from someone\'s inventory',
      clientPermissions: rolePerms,
      userPermissions: rolePerms,
      throttling: {
        usages: 3,
        duration: 5,
      },
      guildOnly: true,
      args: [
        {
          key: 'user',
          prompt: 'The member ID or mention',
          type: 'string',
        },
        {
          key: 'item_name',
          prompt: 'The name of item ',
          type: 'string',
        },
      ],
    });
  }

  public async run(
    msg: commando.CommandoMessage,
    { user, item_name }: {
            user: string,
            item_name: string,
        },
  ): Promise<Message | Message[]> {
    const allUserInv = await getUserInvetory(msg.guild.id);
    const shopDb = await getServerShop(msg.guild.id);

    if (allUserInv === undefined) {
      // if there are no users return
      return msg.say('There seems to be a problem please contact the developer or staff');
    }

    if (shopDb === undefined) {
      // if there are no users return
      return msg.say('There seems to be a problem please contact the developer or staff');
    }

    const shop = shopDb.find((item) => item.item_name === item_name);

    if (shop === undefined) {
      return msg.say('That item is not in the shop, please add it there first');
    }

    const member = getMember(user, msg.guild);

    if (member === undefined) {
      return msg.say('I couldn\'t find that user');
    }

    const userInv = allUserInv.find((theUser) => theUser.uid === member.id);

    if (userInv === undefined) {
      return msg.say('This user has nothing in their inventory');
    }

    if (!userInv.item_list.includes(shop.item_name)) {
      return msg.say('This user does not have that item');
    }

    const index = userInv.item_list.findIndex((item) => item.includes(shop.item_name));
    userInv.item_list.splice(index, 1);
    const newItemList = userInv.item_list;

    updateUserInvetory(
      {
        username: msg.author.username,
        uid: msg.author.id,
        guild_id: msg.guild.id,
        item_list: newItemList,
      },
    );

    return msg.say(`I have removed \`${item_name}\` from \`${member.user.tag}\``);
  }
}
