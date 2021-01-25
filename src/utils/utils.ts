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

/**
 * Used to check member mentions/ID's if they are roles
 * @param {string} uid The Member's ID
 * @param {Guild} guild the Guild instance the of where the Member is from
 * @returns {GuildMember} A Member instance from a server
 */
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
  return guild.members.cache.get(uidParsed);
}

/**
 * Used to check if a user has at least one role from a list, returns true if found
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

/**
 *Used to create pages of an array
 * @param {object[]} array The array to create pages for
 * @param {number} PageSize How long do you want the pages to be
 * @param {number} PageNumber What page of the array do you want to be on
 * @returns {string[]} The page of the array you want
 */
export function paginate(array: any, PageSize: number, PageNumber: number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((PageNumber - 1) * PageSize, PageNumber * PageSize);
}
