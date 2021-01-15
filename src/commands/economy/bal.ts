import { Message, MessageEmbed } from 'discord.js';
import * as commando from 'discord.js-commando';
import { getUserBalance } from '../../db/balance';
import { CONFIG, rolePerms } from '../../globals';
import { checkRoles, getMember } from '../../utils/utils';

// Creates a new class (being the command) extending off of the commando client
export default class UserInfoCommand extends commando.Command {
  constructor(client: commando.CommandoClient) {
    super(client, {
      name: 'bal',
      // Creates aliases
      aliases: ['$', 'currency', 'balance'],
      // This is the group the command is put in
      group: 'economy',
      // This is the name of set within the group (most people keep this the same)
      memberName: 'bal',
      description: 'Checks how much money a user has!',
      // Ratelimits the command usage to 3 every 5 seconds
      throttling: {
        usages: 3,
        duration: 5,
      },
      args: [
        {
          key: 'memberID',
          type: 'string',
          prompt: 'You can mention or user a Members ID',
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
    { memberID }: { memberID: string },
  ): Promise<Message | Message[]> {
    const perms = checkRoles(msg.member, CONFIG.allowedRoles);

    if (!perms) {
      return msg.say(`You do not have permission to use this command ${msg.member},\n`
        + `use \`${CONFIG.prefix}booster list\` to check who can use the command!`);
    }

    const balance = await getUserBalance(msg.guild.id);

    if (balance === undefined) {
      // if there are no users return
      return msg.say('There seems to be a problem please contact the developer or staff');
    }

    const member = getMember(memberID, msg.guild);

    let userDb = balance.find((user) => user.uid === msg.author.id);

    if (member !== undefined) {
      userDb = balance.find((user) => user.uid === member.id);
    }
    const embed = new MessageEmbed();
    switch (member) {
      case undefined:

        if (userDb === undefined) {
          // if there are no users return
          return msg.say('You have no money stored, You may not be a booster for the server');
        }

        embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }));
        embed.setTitle(`${msg.author.username}'s Balance`);
        embed.setDescription(`${msg.author.username} has **${userDb.balance}🍩** Donuts`);
        embed.setFooter('Donuts Currency is only available for server boosters!');
        return msg.say(embed);

      default:

        if (userDb === undefined) {
          // if there are no users return
          return msg.say('That user has no money stored, they may not be a booster for the server');
        }
        embed.setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }));
        embed.setTitle(`${member.user.username}'s Balance`);
        embed.setDescription(`${member.user.username} has **${userDb.balance}🍩** Donuts`);
        embed.setFooter('Donuts Currency is only available for server boosters!');
        return msg.say(embed);
    }
  }
}
