import * as commando from 'discord.js-commando';
import { Message, MessageEmbed } from 'discord.js';
import { getRepository } from 'typeorm';
import { CONFIG } from '../../bot/globals';
import { Guild } from '../../entity/guild';
import { Inventory } from '../../entity/inventory';
import { ItemMeta } from '../../entity/item';
import { User } from '../../entity/user';
import { checkRoles } from '../../bot/utils/utils';

// Creates a new class (being the command) extending off of the commando client
export default class BuyCommand extends commando.Command {
  public constructor(client: commando.CommandoClient) {
    super(client, {
      args: [
        {
          error: 'Make sure that the name is EXACTLY the same as it appears on the shop',
          key: 'itemName',
          prompt: 'What do you want to buy?',
          type: 'string',
        },
      ],
      clientPermissions: ['EMBED_LINKS'],
      description: 'Buy anything from a server shop',
      // This is the group the command is put in
      group: 'economy',
      guildOnly: true,
      // This is the name of set within the group (most people keep this the same)
      memberName: 'buy',
      name: 'buy',
      // Ratelimits the command usage to 3 every 5 seconds
      throttling: {
        duration: 5,
        usages: 3,
      },
    });
  }

  // Now to run the actual command, the run() parameters need to be defiend (by types and names)
  public async run(
    msg: commando.CommandoMessage,
    { itemName }: {itemName: string; },
  ): Promise<Message | Message[]> {
    const perms = checkRoles(msg.member, CONFIG.allowedRoles);
    if (!perms) {
      return msg.say(`You do not have permission to use this command ${msg.member},\n`
        + `use \`${CONFIG.prefix}booster list\` to check who can use the command!`);
    }

    const userRepo = getRepository(User);
    const itemsRepo = getRepository(ItemMeta);
    const invRepo = getRepository(Inventory);
    const guildRepo = getRepository(Guild);

    if (msg.guild === null) {
      return msg.say('Sorry there was a problem please try again');
    }

    const guild = await guildRepo.findOne({ serverid: msg.guild.id });
    let user = await userRepo.findOne({ serverId: msg.guild.id, uid: msg.author.id });
    const item = await itemsRepo.findOne({ guild, name: itemName });
    const inv = await invRepo.findOne({ serverid: msg.guild.id, uid: msg.author.id });

    if (!item) {
      return msg.say('That item does not exist in the shop, try again with the exact name!');
    }

    if (!user) {
      const newUser = new User();
      newUser.uid = msg.author.id;
      newUser.serverId = msg.guild.id;
      newUser.avatar = msg.author.displayAvatarURL({ dynamic: true });
      newUser.tag = msg.author.tag;
      newUser.balance = 1;
      userRepo.save(newUser);
      user = newUser;
    }

    if (user.balance < item.price) {
      return msg.say(`You don't have enough Donuts for **${item.name}**!`);
    }

    if (item.max === 0) {
      return msg.say(
        String(`Sorry there are no more **${itemName}'s** left in stock!`
                + `\nPlease ask a server manager to add to the stock with \`${CONFIG.prefix}addstock\`!`
                + '```diff\n- OUT OF STOCK```'),
      );
    }

    if (!inv) {
      const newInv = new Inventory();
      newInv.serverid = msg.guild.id;
      newInv.uid = msg.author.id;
      newInv.user = user;
      newInv.items = [item.name];
      invRepo.save(newInv);
    } else {
      inv.items.push(item.name);
      invRepo.save(inv);
    }

    user.balance -= item.price;
    item.max -= 1;
    userRepo.save(user);
    itemsRepo.save(item);

    let guildicon = msg.guild.iconURL({ dynamic: true });
    if (guildicon === null) {
      guildicon = '';
    }

    const embed = new MessageEmbed()
      .setThumbnail(guildicon)
      .setColor('BLUE')
      .setTitle('Currency')
      .setAuthor(user.tag, user.avatar)
      .setDescription(`You just bought **${itemName}**, You can find it with \`${CONFIG.prefix}inv\`!`)
      .setFooter(`You can use ${CONFIG.prefix}inv to check what items you have`)
      .setTimestamp();
    return msg.channel.send(embed);
  }
}
