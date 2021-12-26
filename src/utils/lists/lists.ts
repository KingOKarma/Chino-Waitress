import { CONFIG, STORAGE } from "../../globals";
import { Message, MessageEmbed } from "discord.js";
import ExtendedClient from "../../client/client";
import Storage from "../../storage";

/**
 * Works the same as addRole() but adds a string instead
 * @param {Message} msg Message instance
 * @param {string} string The String to use
 * @param {string[]} array The array to add to
 * @param {string[]} array2 The second array to make sure no duplicates are made
 */
export async function addList(
    client: ExtendedClient,
    msg: Message,
    string: string | undefined,
    array: string[],
    array2: string[]
): Promise<void | Message> {
    // Checks if the role they want to add is already added
    if (string === undefined) return client.reply(msg, { content: "No string was supplied" });
    if (array.includes(string)) {
        return client.reply(msg, { content: "That is already on the list! ❌" });
    }

    // Checks if the role they want to add is already on the "removal" list
    if (array2.includes(string)) {
        return client.reply(msg, {
            content:
                "That is on the other role list, adding this to the"
                + " current list would break the system! ❌"
        });
    }

    // Otherwise finally add it to the list
    array.push(string);
    Storage.saveConfig();

    return client.reply(msg, {
        content:
            `I have added the role \`${string}\` to the list! ✅`
    });
}

/**
   * Works the same as removeRole() but uses strings instead
   * @param {Message} msg Message instance
   * @param {string} number the String to use
   * @param {string[]} array The array to remove from
   */
export async function removeList(
    client: ExtendedClient,
    msg: Message,
    number: string | undefined,
    array: string[]
): Promise<void | Message> {
    const numCheck = new RegExp("/^[0-9]+$/");
    if (number === undefined) return client.reply(msg, { content: "No number was supplied" });

    if (!numCheck.exec(number)) {
        const stringlist = array.map((list, index) => `${index + 1} - ${list}\n`);

        const embed = new MessageEmbed()
            .setAuthor({ "iconURL": msg.author.displayAvatarURL({ dynamic: true }), "name": msg.author.tag })
            .setTitle("Choices:")
            .setDescription(stringlist.join(""))
            .setFooter(`You can delete these wtih ${CONFIG.prefix}cw remove <number>`);

        return client.reply(msg, { embeds: [embed] });
    }
    // Checks the location in the array for the role
    const stringIndex = Number(number) - 1;
    const string = STORAGE.workResponses[stringIndex] as string | undefined;

    if (string === undefined) {
        return client.reply(msg, { content: "That choice does not exists" });
    }

    // Removes the string from the array with the index number
    const findString = array.indexOf(string);

    array.splice(findString, 1);
    Storage.saveConfig();

    return client.reply(msg, {
        content:
            `I have removed the choice\n\`${string}\` from the list ✅`
    });
}

/**
   * Used to list the roles from an array
   * @param {Message} msg Message instance
   * @param {string[]} array The array to list
   * @param {string} title The list's name
   * @returns {MessageEmbed} Emeded list of roles
   */
export async function listList(
    client: ExtendedClient,
    msg: Message,
    array: string[],
    title: string
): Promise<void | Message> {
    if (!array.length) {
        return client.reply(msg, {
            content:
                `The list is currently emtpy! use \`${CONFIG.prefix}add <string>\``
                + "to add a string to the list!"
        });
    }
    const roleList = array.map((list) => `○ ${list}\n`);
    const embed = new MessageEmbed()
        .setAuthor({ "iconURL": msg.author.displayAvatarURL({ dynamic: true }), "name": msg.author.tag })
        .setTitle(title)
        .setTimestamp()
        .setDescription(roleList.join(""))
        .setFooter("{bal} means balance earned");

    try {
        return await client.reply(msg, { embeds: [embed] });
    } catch (_) {
        const roles = roleList.join("");
        return client.reply(msg, { content: `listed roles:\n ${roles}` });
    }
}
