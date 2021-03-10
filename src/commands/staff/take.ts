/* eslint-disable camelcase */
import * as commando from 'discord.js-commando';
import {
} from '../../bot/utils/roles';
import { Message, MessageEmbed } from 'discord.js';
import { getRepository } from 'typeorm';
import { rolePerms } from '../../bot/globals';
import { User } from '../../entity/user';
import { getMember } from '../../bot/utils/utils';

export default class colourListCommand extends commando.Command {
  constructor(client: commando.CommandoClient) {
    super(client, {
      name: 'take',
      group: 'staff',
      memberName: 'take',
      description: 'takes money from a user',
      clientPermissions: rolePerms,
      userPermissions: rolePerms,
      throttling: {
        usages: 3,
        duration: 5,
      },
      guildOnly: true,
      args: [
        {
          key: 'memberID',
          prompt: 'The User you are taking from',
          type: 'string',
        },
        {
          key: 'amount',
          prompt: 'How much are you taking from the user?',
          type: 'integer',
          validate: (amount: number) => amount >= 0,
          error: 'Please only use a number for the price',
        },
      ],
    });
  }

  public async run(
    msg: commando.CommandoMessage,
    { memberID, amount }: {
      memberID: string,
          amount: number,
         },
  ): Promise<Message | Message[]> {
    const userRepo = getRepository(User);
    let member = await getMember(memberID, msg.guild);

    if (member === null) {
      member = msg.member;
    }

    let user = await userRepo.findOne({ serverId: msg.guild.id, uid: member.user.id });

    if (!user) {
      const newUser = new User();
      newUser.uid = member.user.id;
      newUser.serverId = member.guild.id;
      newUser.avatar = member.user.displayAvatarURL({ dynamic: true });
      newUser.tag = member.user.tag;
      newUser.balance = 1;
      userRepo.save(newUser);
      user = newUser;
    }

    let userBal = user.balance;
    userBal -= amount;

    user.balance -= amount;
    userRepo.save(user);
    const embed = new MessageEmbed()
      .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
      .setTitle('User Take')
      .setDescription(`I have taken **${amount}🍩** from \`${member.user.tag}\` they now have **${userBal}**🍩 Donuts`)
      .setFooter(`Taken by ${msg.author.tag}`)
      .setTimestamp();
    return msg.say(embed);
  }
}
