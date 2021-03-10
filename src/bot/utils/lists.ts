import { Message, MessageEmbed } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import Config from '../config';
import { CONFIG } from '../globals';

/**
 * Works the same as addRole() but adds a string instead
 * @param {CommandoMessage} msg Message instance
 * @param {string} string The String to use
 * @param {string[]} array The array to add to
 * @param {string[]} array2 The second array to make sure no duplicates are made
 */
export function addList(
  msg: CommandoMessage,
  string: string,
  array: string[],
  array2: string[],
): Promise<Message | Message[]> {
  // Checks if the role they want to add is already added
  if (array.includes(string)) {
    return msg.say('That is already on the list! ❌');
  }

  // Checks if the role they want to add is already on the "removal" list
  if (array2.includes(string) && (array2 !== undefined)) {
    return msg.say(
      'That is on the other role list, adding this to the'
      + ' current list would break the system! ❌',
    );
  }

  // Otherwise finally add it to the list
  array.push(string);
  Config.saveConfig();

  return msg.say(
    `I have added the role \`${string}\` to the list! ✅`,
  );
}

/**
   * Works the same as removeRole() but uses strings instead
   * @param {CommandoMessage} msg Message instance
   * @param {string} number the String to use
   * @param {string[]} array The array to remove from
   */
export function removeList(
  msg: CommandoMessage,
  number: string,
  array: string[],
): Promise<Message | Message[]> {
  if (!number.match('^[0-9]+$')) {
    const stringlist = array.map((list, index) => `${index + 1} - ${list}\n`);

    const embed = new MessageEmbed()
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
      .setTitle('Choices:')
      .setDescription(stringlist.join(''))
      .setFooter(`You can delete these wtih ${CONFIG.prefix}cw remove <number>`);

    return msg.say(embed);
  }
  // Checks the location in the array for the role
  const stringIndex = Number(number) - 1;
  const string = CONFIG.workResponses[stringIndex];

  if (string === undefined) {
    return msg.say('That choice does not exists');
  }

  // Removes the string from the array with the index number
  const findString = array.indexOf(string);

  array.splice(findString, 1);
  Config.saveConfig();

  return msg.say(
    `I have removed the choice\n\`${string}\` from the list ✅`,
  );
}

/**
   * Used to list the roles from an array
   * @param {CommandoMessage} msg Message instance
   * @param {string[]} array The array to list
   * @param {string} title The list's name
   * @returns {MessageEmbed} Emeded list of roles
   */
export function listList(
  msg: CommandoMessage,
  array: string[],
  title: string,
): Promise<Message | Message[]> {
  if (!array.length) {
    return msg.say(
      `The list is currently emtpy! use \`${CONFIG.prefix}add <string>\``
        + 'to add a string to the list!',
    );
  }
  const roleList = array.map((list) => `○ ${list}\n`);
  const embed = new MessageEmbed()
    .setAuthor(
      msg.author.tag,
      msg.author.displayAvatarURL({ dynamic: true }),
    )
    .setTitle(title)
    .setTimestamp()
    .setDescription(roleList.join(''))
    .setFooter('{bal} means balance earned');

  try {
    return msg.say(embed);
  } catch (_) {
    const roles = roleList.join('');
    return msg.say(`listed roles:\n ${roles}`);
  }
}
