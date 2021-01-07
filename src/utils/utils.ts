import { Guild, GuildMember } from 'discord.js';

/**
 * Used to check role mentions/ID's if they are roles
 * @param {Guild} guild the Guild instance the of where the Role is from
 * @param {string} rid The role mention/ID (Optional)
 * @returns {Role} A Role instance or undefined
 */
export function getRole(
  guild: Guild,
  rid?: string,
) {
  let ridParsed = rid;
  // if the first argument is  undefined return
  if (rid === undefined || ridParsed === undefined) {
    return undefined;
  }
  // Check if a role was tagged or not. If the role was tagged remove the
  // tag from rid.
  if (rid.startsWith('<@&') && rid.endsWith('>')) {
    const re = new RegExp('[<@&>]', 'g');
    ridParsed = rid.replace(re, '');
  }
  // Try recovering the role and report if it was successful or not.
  return guild.roles.cache.get(ridParsed);
}

export function getMember(
  uid: string,
  guild: Guild,
) {
  let uidParsed = uid;
  // Check if a member was tagged or not. If the member was tagged remove the
  // tag from uid.
  if (uid.startsWith('<@') && uid.endsWith('>')) {
    const re = new RegExp('[<@!>]', 'g');
    uidParsed = uid.replace(re, '');
  }
  // Try recovering the role and report if it was successful or not.
  try {
    return guild.members.cache.get(uidParsed);
  } catch (e) {
    console.log(`Member not found because ${e}`);
    return undefined;
  }
}

/**
 * Used to check if a user has at least one role from a list
 * @param {GuildMember} member The member instance
 * @param {string[]} array the array of role ID's to check through
 * @returns {boolean} true or false
 */
export function checkRoles(
  member: GuildMember,
  array: string[],
): boolean {
  const check = member.roles.cache.map((role) => role.id);

  // Loop over member roles to check if they have whitelisted roles
  const foundList = check.some((roleList) => array.includes(roleList));

  if (foundList) {
    return true;
  }
  return false;
}
