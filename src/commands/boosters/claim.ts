import { Message, MessageEmbed } from 'discord.js';
import * as commando from 'discord.js-commando';
import { CONFIG, rolePerms } from '../../globals';
import { checkRoles, getRole } from '../../utils/utils';

// Creates a new class (being the command) extending off of the commando client
export default class UserInfoCommand extends commando.Command {
  constructor(client: commando.CommandoClient) {
    super(client, {
      name: 'claim',
      // Creates aliases
      aliases: ['get', 'role'],
      // This is the group the command is put in
      group: 'boosters',
      // This is the name of set within the group (most people keep this the same)
      memberName: 'claim',
      description: 'Give\'s boosters their special roles!',
      // Ratelimits the command usage to 3 every 5 seconds
      throttling: {
        usages: 3,
        duration: 5,
      },
      args: [
        {
          key: 'number',
          type: 'string',
          prompt: 'I need a number eqaul to one of the roles in the list',
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
    { number }: { number: string },
  ): Promise<Message | Message[]> {
    const perms = checkRoles(msg.member, CONFIG.allowedRoles);
    if (!perms) {
      return msg.say(`You do not have permission to use this command ${msg.member},\n`
        + `use \`${CONFIG.prefix}booster list\` to check who can use the command!`);
    }

    if (!number.match('^[0-9]+$')) {
      const roleList = CONFIG.colourRoles.map((list, index) => `${index + 1} - <@&${list}>\n`);

      const embed = new MessageEmbed()
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
        .setTitle('Your Claimable Rewards:')
        .setDescription(roleList.join(''))
        .setFooter('You can also get these roles by becoming a booster today!');

      return msg.say(embed);
    }
    const roleIndex = Number(number) - 1;
    const role = CONFIG.colourRoles[roleIndex];
    const roleInstance = getRole(msg.guild, role);

    if (roleInstance === undefined) {
      return msg.say('That role does not exist');
    }

    if (msg.member.roles.cache.get(role)) {
      return msg.say(`You already have the \`${roleInstance.name}\` role`);
    }

    msg.member.roles.add(roleInstance, 'They used their booster perks');

    const embed = new MessageEmbed()
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
      .setTitle(`${msg.author.username} Just Claimed the ${roleInstance.name} Role`)
      .setDescription(`You can remove the ${roleInstance} with \`${CONFIG.prefix}remove <number>\``)
      .setFooter('You can also get these roles by becoming a booster today!');

    return msg.say(embed);
  }
}
