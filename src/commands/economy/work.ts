import * as commando from 'discord.js-commando';
import { Message, MessageEmbed } from 'discord.js';
import { getRepository } from 'typeorm';
import ms from 'ms';
import { CONFIG } from '../../bot/globals';
import { Guild } from '../../entity/guild';
import { User } from '../../entity/user';

const timeOut = new Map();
const devs = CONFIG.owners;

export default class WorkCommand extends commando.Command {
  public constructor(client: commando.CommandoClient) {
    super(client, {
      description: 'Work to become a world renowned KFC worker',
      group: 'economy',
      guildOnly: true,
      memberName: 'work',
      name: 'work',
      throttling: {
        duration: 3,
        usages: 4,
      },
    });
  }

  public async run(
    msg: commando.CommandoMessage,
  ): Promise<Message | Message[]> {
    const userRepo = getRepository(User);
    const guildRepo = getRepository(Guild);

    if (msg.guild === null) {
      return msg.say('Sorry there was a problem please try again');
    }

    let guild = await guildRepo.findOne({ serverid: msg.guild.id });
    let user = await userRepo.findOne({ serverId: msg.guild.id, uid: msg.author.id });

    // If there is no Guild then add to  DB
    if (!guild) {
      const newGuild = new Guild();
      newGuild.serverid = msg.guild.id;
      newGuild.name = msg.guild.name;
      guildRepo.save(newGuild);
      guild = newGuild;
    }

    if (!user) {
      const newUser = new User();
      newUser.uid = msg.author.id;
      newUser.serverId = msg.guild.id;
      newUser.avatar = msg.author.displayAvatarURL({ dynamic: true });
      newUser.tag = msg.author.tag;
      newUser.balance = 1;
      await userRepo.save(newUser);
      user = newUser;
    }

    // Return msg.say("There was a problem getting your user from the database, try again!");

    const isdev = devs.some((checkDev) => checkDev === msg.author.id);
    const timeout = 21600 * 1000;
    const key = `${msg.author.id}work`;
    const found = timeOut.get(key);

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (found && !isdev) {
      const timePassed = Date.now() - found;
      const timeLeft = timeout - timePassed;
      return msg.say(`**Whoa there you're a bit too fast there. you gotta wait another ${ms(timeLeft)}!**`);
    }

    const earn = Math.floor((Math.random() * 500) + 100);
    timeOut.set(key, Date.now());

    // 6 hours/1000 in miliseconds
    const HOURS = 21600;

    setTimeout(() => {
      timeOut.delete(`${msg.author.id}work`);
      // 6 hours
    }, HOURS * 1000);

    let response = CONFIG.workResponses[Math.floor(Math.random() * CONFIG.workResponses.length)];

    const bal = `**${earn}🍩**`;

    if (response.includes('{bal}')) {
      const replace = new RegExp('{bal}', 'g');
      response = response.replace(replace, bal);
    }
    const embed = new MessageEmbed();

    embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }));
    embed.setTitle('Working Hours');
    embed.setDescription(response);
    embed.setFooter('Donuts Currency is only available for server boosters!');
    return msg.say(embed);
  }
}
