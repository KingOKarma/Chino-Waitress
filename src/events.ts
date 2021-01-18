import { Client, GuildMember, Message } from 'discord.js';
import fs from 'fs';
import { addUserBalance, getUserBalance, updateUserBalance } from './db/balance';
import { CONFIG } from './globals';
import { checkRoles } from './utils/utils';

export function onReady(bot: Client) {
  if (!bot.user) {
    return;
  }
  console.log(`${bot.user.tag} Bot has started, with ${bot.users.cache.size} users, in ${bot.channels.cache.size} channels of ${bot.guilds.cache.size} guilds.`);

  bot.user.setActivity('I\'m still a work in progress owo!'); // sets status

  setInterval(() => {
    if (!bot.user) {
      return;
    }
    // If you know a better way of getting this system to work feel free
    // to contact me.
    const files = fs.readdirSync('./src/pfps');

    const chosenFile = files[Math.floor(Math.random() * files.length)];

    bot.user.setAvatar(`./src/pfps/${chosenFile}`)
      .catch((err) => {
        console.log(err);
      });

    console.log(`Pfp has changed to \n${chosenFile}`);
  }, 86400000);

  // 86400000 = 24 hours
}

/**
 * Triggered when a member updates their profile info
 * @param {GuildMember} _ Old iteration of the member's profile (not needed)
 * @param {GuildMember} mem New iteration of the member's profile
 */
export function onMemberUpdate(_: GuildMember, mem: GuildMember) {
  const check = mem.roles.cache.map((role) => role.id);

  // Loop over member roles to check if they have whitelisted roles
  const foundWhitelist = check.some((hasRole) => CONFIG.allowedRoles.includes(hasRole));

  const channel = mem.guild.channels.cache.get(CONFIG.boosterChannel);

  if (channel === undefined) {
    return;
  }

  if (!foundWhitelist) {
    // Loop over member roles to check if they have colour roles
    const foundColourRole = check.some((colorRoleId) => CONFIG.colourRoles.includes(colorRoleId));

    if (foundColourRole) {
      CONFIG.colourRoles.forEach(async (role) => {
        const memberRoles = mem.roles.cache;
        const invalidRole = memberRoles.get(role);
        if (invalidRole) {
          try {
            await mem.roles.remove(role, 'Doesn\'t have required role');
          } catch {
            console.log(`Missing perms to remove colour roles from ${mem.user.tag}`);
          }
        }
      });
    }
  }
  if (check.includes(CONFIG.mutedRole)) {
    channel.overwritePermissions([
      {
        id: mem.user.id,
        deny: ['SEND_MESSAGES'],
      },
    ]);
  }
  if (!check.includes(CONFIG.mutedRole)) {
    const memberPerms = channel.permissionOverwrites.get(mem.user.id);
    if (memberPerms === undefined) {
      return;
    }
    memberPerms.delete('No longer muted');
  }
}

const balDely = new Set();

/**
 * Triggered when a message is sent
 * @param {Message} msg The Message Instance
 */
export async function onMessage(msg: Message) {
  setTimeout(async () => {
    if (msg.author.bot) {
      return undefined;
    }
    if (msg.guild === null) {
      return console.log('Not in a guild');
    }
    if (msg.member === null) {
      return undefined;
    }

    const perms = checkRoles(msg.member, CONFIG.allowedRoles);
    if (!perms) {
      return undefined;
    }
    addUserBalance(msg.author, msg.guild.id);

    const balance = await getUserBalance(msg.guild.id);

    if (balance === undefined) {
    // if there are no users return
      return undefined;
    }

    const userDb = balance.find((user) => user.uid === msg.author.id);

    if (userDb === undefined) {
    // if there are no users return
      return undefined;
    }

    if (!balDely.has(msg.author.id)) {
      let userBalance = userDb.balance;

      userBalance += Math.floor((Math.random() * 7) + 2);

      const newBal = Math.round(userBalance);
      updateUserBalance(
        {
          username: msg.author.tag,
          uid: msg.author.id,
          guild_id: msg.guild.id,
          balance: newBal,
        },
      );
      balDely.add(msg.author.id);

      setTimeout(() => {
        balDely.delete(msg.author.id);
      }, 10000);
    }

    return undefined;
  }, 500);
}
