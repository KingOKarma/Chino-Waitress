import * as commando from 'discord.js-commando';
import { Message, MessageEmbed } from 'discord.js';
import { getRepository } from 'typeorm';
import { CONFIG } from '../../bot/globals';
import { User } from '../../entity/user';
import { checkRoles, userpaginate } from '../../bot/utils/utils';

export default class LeaderboardCommand extends commando.Command {
  public constructor(client: commando.CommandoClient) {
    super(client, {
      aliases: ['lb'],
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
      description: 'Lists the Donuts leaderboard for the server!',
      group: 'economy',
      guildOnly: true,
      memberName: 'leaderboard',
      name: 'leaderboard',
      throttling: {
        duration: 30,
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

    const userRepo = getRepository(User);

    if (msg.guild === null) {
      return msg.say('Sorry there was a problem please try again');
    }

    const users = await userRepo.find({
      order: { serverId: 'DESC', uid: 'DESC' },
      where: [{ serverId: msg.guild.id }],
    });
    users.sort((a, b) => b.balance - a.balance);

    users.forEach((usersArray, index) => {
      // eslint-disable-next-line no-param-reassign
      usersArray.tag = `${index + 1} || ${usersArray.tag}`;
    });
    const iteamsPaged: User[] = userpaginate(users, 9, page);

    const authorPost = users.find((user) => user.uid === msg.author.id);

    if (authorPost === undefined) return msg.say('There was a problem getting your user from the database, try again!');

    if (iteamsPaged.length === 0) return msg.say('There are no members on that page');

    const embed = new MessageEmbed()
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
      .setTitle(`${msg.guild.name}'s Leaderboard`)
      .setDescription(`You are: **${authorPost.tag}**\n with \`${authorPost.balance}\`🍩 Donuts`)
      .setFooter(`You can find the next page with ${CONFIG.prefix}lb <page_number>`);
    iteamsPaged.forEach((user) => embed.addField(user.tag, `**${user.balance}**🍩 Donuts`, true));

    return msg.say(embed);
  }
}
