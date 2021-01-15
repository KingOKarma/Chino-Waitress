/* eslint-disable camelcase */
import * as commando from 'discord.js-commando';
import {
} from '../../utils/roles';
import { Message, MessageEmbed } from 'discord.js';
import { rolePerms } from '../../globals';
import { getUserBalance, updateUserBalance } from '../../db/balance';
import { getMember } from '../../utils/utils';

export default class colourListCommand extends commando.Command {
  constructor(client: commando.CommandoClient) {
    super(client, {
      name: 'give',
      group: 'staff',
      memberName: 'give',
      description: 'Gives money to a user',
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
          prompt: 'The User you are giving to',
          type: 'string',
        },
        {
          key: 'amount',
          prompt: 'How much are you giving the user?',
          type: 'integer',
          error: 'Please only use a number for the price, please chose a number above 1',
        },
      ],
    });
  }

  public async run(
    msg: commando.CommandoMessage,
    { user, amount }: {
         user: string,
          amount: number,
         },
  ): Promise<Message | Message[]> {
    const userDb = await getUserBalance(msg.guild.id);
    const member = getMember(user, msg.guild);

    if (member === undefined) {
      return msg.reply('Sorry I cannot find that user!');
    }
    if (userDb === undefined) {
      return msg.reply('Seems to be a problem, please contact the developer');
    }

    const userBal = userDb.find((userDB) => userDB.uid === member.id);

    if (userBal === undefined) {
      return msg.reply('Couldn\'t find that user, they might not have any money in the database');
    }

    let userBalance = userBal.balance;

    userBalance += amount;

    updateUserBalance(
      {
        username: member.user.tag,
        uid: member.user.id,
        guild_id: msg.guild.id,
        balance: userBalance,
      },
    );
    const embed = new MessageEmbed()
      .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
      .setTitle('User Give')
      .setDescription(`I have given **${amount}🍩** to \`${member.user.tag}\` they now have **${userBalance}**🍩`)
      .setFooter(`Given by ${msg.author.tag}`)
      .setTimestamp();
    return msg.say(embed);
  }
}
