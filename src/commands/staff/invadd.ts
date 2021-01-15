/* eslint-disable camelcase */
import * as commando from 'discord.js-commando';
import {
} from '../../utils/roles';
import { Message } from 'discord.js';
import { rolePerms } from '../../globals';
import { getServerShop } from '../../db/shop';
import { addUserInvetory, getUserInvetory, updateUserInvetory } from '../../db/inventory';
import { getMember } from '../../utils/utils';

export default class colourListCommand extends commando.Command {
  constructor(client: commando.CommandoClient) {
    super(client, {
      name: 'invadd',
      aliases: ['inventoryadd'],
      group: 'staff',
      memberName: 'invadd',
      description: 'Adds a new item to a user\'s inv',
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
          prompt: 'What Item are you uadding?',
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
      // if there are no users return
      addUserInvetory(member.user, msg.guild.id);

      return msg.say('They have never bought anything, let me add them to the database '
      + 'then try again');
    }

    userInv.item_list.push(shop.item_name);
    const newItemList = userInv.item_list;

    updateUserInvetory(
      {
        username: msg.author.username,
        uid: msg.author.id,
        guild_id: msg.guild.id,
        item_list: newItemList,
      },
    );

    return msg.say(`I have added \`${item_name}\` to \`${member.user.tag}\` inventory`);
  }
}
