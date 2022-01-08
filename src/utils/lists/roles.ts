import ExtendedClient from "../../client/client";
import { Message } from "discord.js";
import Storage from "../../storage";
import { getRole } from "../../utils/getRole";

/**
 * Used to add a role to an array
 * @param {ExtendedClient} client The client instance
 * @param {Message} msg Message instance
 * @param {string} rid The Role ID of the User
 * @param {string[]} array The array to add to
 * @param {string[]} array2 The second array to make sure no duplicates are made
 */
export async function addRole(
    client: ExtendedClient,
    msg: Message,
    rid: string | undefined,
    array: string[],
    array2: string[]
): Promise<void | Message> {
    const role = await getRole(rid ?? "none", msg.guild);

    // If the first argument is the @everyone id or undefined return
    if (!role || rid === msg.guild?.id) {
        return client.embedReply(msg, { embed: { description: "That' not a role! ❌" } });
    }

    const roleID: string = role.id;

    // Checks if the role they want to add is already added
    if (array.includes(roleID)) {
        return client.embedReply(msg, { embed: { description: `\`${role.name}\` is already on the list! ❌` } });
    }

    // Checks if the role they want to add is already on the "removal" list
    if (array2.includes(roleID)) {
        return client.embedReply(msg, {
            embed: {
                description:
                    `\`${role.name}\` is on the other role list, adding this to the`
                    + " current list would break the system! ❌"
            }
        });
    }

    // Otherwise finally add it to the list
    array.push(roleID);
    Storage.saveConfig();

    return client.embedReply(msg, {
        embed: {
            description:
                `I have added the role \`${role.name}\` to the list! ✅`
        }
    });
}

/**
   * Used to remove a role from an array
   * @param {Message} msg Message instance
   * @param {string} rid The Role ID of the User
   * @param {string[]} array The array to remove from
   * @param {string[]} array2 The second array to make sure no duplicates are made
   */
export async function removeRole(
    client: ExtendedClient,
    msg: Message,
    rid: string | undefined,
    array: string[],
    array2: string[]
): Promise<void | Message> {
    const role = await getRole(rid ?? "none", msg.guild);
    // If the first argument is the @everyone id or undefined return
    if (!role || rid === msg.guild?.id) {
        return client.embedReply(msg, { embed: { description: "That' not a role! ❌" } });
    }

    // Checks if the role they want to add is already added
    if (!array.includes(role.id)) {
        return client.embedReply(msg, { embed: { description: `\`${role.name}\` is not on the list! ❌` } });
    }

    // Checks if the role they want to add is already on the other list
    if (array2.includes(role.id)) {
        return client.embedReply(msg, {
            embed: {
                description:
                    `\`${role.name}\` is on the remove role list, adding this to the`
                    + " list would break the system! ❌"
            }
        });
    }
    // Checks the location in the array for the role
    const roleIndex = array.indexOf(role.id);

    // Removes the role from the array with the index number
    array.splice(roleIndex, 1);
    Storage.saveConfig();

    return client.embedReply(msg, {
        embed: {
            description:
                `I have removed the role \`${role.name} \` from the list ✅`
                + `\n*Anyone currently with \`${role.name}\` you will have to`
                + " remove roles manually*"
        }
    });
}

/**
   * Used to list the roles from an array
   * @param {CommandoMessage} msg Message instance
   * @param {string[]} array The array to list
   * @param {string} title The list's name
   * @returns {MessageEmbed} Emeded list of roles
   */
export async function listRoles(
    client: ExtendedClient,
    msg: Message,
    array: string[],
    title: string
): Promise<void | Message> {
    if (!array.length) {
        return client.embedReply(msg, {
            embed: {
                description:
                    `The list is currently emtpy! use ${title}add <role>`
                    + "to add a role to the list!"
            }
        });
    }

    const roleList = array.map((list) => `○ <@&${list}>\n`);

    try {
        return await client.embedReply(msg, {
            embed: {
                author: { iconURL: msg.author.displayAvatarURL({ dynamic: true }), name: msg.author.tag },
                title,
                timestamp: msg.createdTimestamp,
                description: roleList.join("")
            }
        });
    } catch (_) {
        const roles = roleList.join("");
        return client.reply(msg, { content: `listed roles:\n ${roles}` });
    }
}
