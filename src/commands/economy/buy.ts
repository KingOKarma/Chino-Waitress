/* eslint-disable camelcase */
import { Message, MessageEmbed } from 'discord.js';
import * as commando from 'discord.js-commando';
import { getUserBalance, updateUserBalance } from '../../db/balance';
import { addUserInvetory, getUserInvetory, updateUserInvetory } from '../../db/inventory';
import { getServerShop } from '../../db/shop';
import { CONFIG, rolePerms } from '../../globals';
import { checkRoles } from '../../utils/utils';

// Creates a new class (being the command) extending off of the commando client
export default class UserInfoCommand extends commando.Command {
  constructor(client: commando.CommandoClient) {
    super(client, {
      name: 'buy',
      // Creates aliases
      aliases: ['purchase', 'aquire'],
      // This is the group the command is put in
      group: 'economy',
      // This is the name of set within the group (most people keep this the same)
      memberName: 'buy',
      description: 'Buy\'s an item from the server shop',
      // Ratelimits the command usage to 3 every 5 seconds
      throttling: {
        usages: 3,
        duration: 5,
      },
      args: [
        {
          key: 'item_name',
          type: 'string',
          prompt: 'The name of the item you want to buy',
          default: '',
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
    { item_name }: { item_name: string },
  ): Promise<Message | Message[]> {
    const perms = checkRoles(msg.member, CONFIG.allowedRoles);

    if (!perms) {
      return msg.say(`You do not have permission to use this command ${msg.member},\n`
                + `use \`${CONFIG.prefix}booster list\` to check who can use the command!`);
    }

    const balance = await getUserBalance(msg.guild.id);
    const shopDb = await getServerShop(msg.guild.id);

    if (balance === undefined) {
      // if there are no users return
      return msg.say('There seems to be a problem please contact the developer or staff');
    }

    if (shopDb === undefined) {
      // if there are no users return
      return msg.say('There seems to be a problem please contact the developer or staff');
    }

    const userBalDb = balance.find((user) => user.uid === msg.author.id);
    const itemName = shopDb.find((item) => item.item_name === item_name);
    const items = shopDb.map((Items) => Items);

    if (items.length === 0) {
      return msg.say('The shop is empty right now, please come back later!');
    }

    if (itemName === undefined) {
      // if there are no users return
      return msg.say('That item doesn\'t exist');
    }

    if (userBalDb === undefined) {
      // if there are no users return
      return msg.say('You have no money stored, You may not be a booster for the server');
    }

    if (userBalDb.balance < itemName.price) {
      return msg.say('You do not have enough **🍩 Donuts** to buy this item!');
    }

    addUserInvetory(msg.author, msg.guild.id);
    const inventory = await getUserInvetory(msg.guild.id);

    if (inventory === undefined) {
      // if there are no users return
      return msg.say('There seems to be a problem please contact the developer or staff');
    }

    const userInventory = inventory.find((user) => user.uid === msg.author.id);

    if (userInventory === undefined) {
      // if there are no users return
      return msg.say('As this was your first purchace you have'
      + ' just been added to the database, please try and buy the item again');
    }

    userInventory.item_list.push(itemName.item_name);
    const newItemList = userInventory.item_list;

    updateUserInvetory(
      {
        username: msg.author.username,
        uid: msg.author.id,
        guild_id: msg.guild.id,
        item_list: newItemList,
      },
    );
    const newBal = userBalDb.balance - itemName.price;

    updateUserBalance(
      {
        username: msg.author.tag,
        uid: msg.author.id,
        guild_id: msg.guild.id,
        balance: newBal,
      },
    );
    const embed = new MessageEmbed();

    embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }));
    embed.setTitle('Payment successful!');
    embed.setDescription(`**${itemName.price}**🍩 Donuts has been taken out of ${msg.author.username}'s`
            + ` account, they now have **${userBalDb.balance}🍩** Donuts`);
    embed.addField('Item:', `${itemName.item_name}`);
    embed.addField('Item Description:', `${itemName.item_desc}`);
    embed.setFooter('Donuts Currency is only available for server boosters!');
    return msg.say(embed);
  }
}
