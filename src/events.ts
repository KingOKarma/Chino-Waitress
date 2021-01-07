import { Client, GuildMember } from 'discord.js';
import fs from 'fs';
import { CONFIG } from './globals';

export function onReady(bot: Client) {
  if (!bot.user) {
    return;
  }
  console.log(`${bot.user.tag} Bot has started, with ${bot.users.cache.size} users, in ${bot.channels.cache.size} channels of ${bot.guilds.cache.size} guilds.`);

  bot.user.setActivity('I\'m still a work in progress owo!'); // sets status

  setInterval(() => {
    // Temporary fix, as i cannot be asked to make this look better right now
    if (!bot.user) {
      return;
    }
    const files = fs.readdirSync('./pfps');

    const chosenFile = files[Math.floor(Math.random() * files.length)];

    bot.user.setAvatar(`./pfps/${chosenFile}`)
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

  if (foundWhitelist) {
    return;
  }

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
