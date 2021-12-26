import { Message, MessageEmbed } from "discord.js";
import ExtendedClient from "../../client/client";
import Storage from "../../storage";
import { getVc } from "../../utils/getVC";

/**
 * Used to add a VC to an array
 * @param {Message} msg Message instance
 * @param {string} rid The VCs ID
 * @param {string[]} array The array to add to
 */
export async function addVc(
    client: ExtendedClient,
    msg: Message,
    rid: string | undefined,
    array: string[]
): Promise<void | Message> {
    if (!msg.guild) return;

    const vc = await getVc(rid, msg.guild);
    if (!vc) {
        return client.reply(msg, { content: "Please use the ID of a voice channel" });
    }


    const vcID: string = vc.id;

    // Checks if the role they want to add is already added
    if (array.includes(vcID)) {
        return client.reply(msg, { content: `\`${vc.name}\` is already on the list! ❌` });
    }

    // Otherwise finally add it to the list
    array.push(vcID);
    Storage.saveConfig();

    return client.reply(msg, {
        content:
            `I have added the role \`${vc.name}\` to the list! ✅`
    });
}

/**
   * Used to remove a VC from an array
   * @param {Message} msg Message instance
   * @param {string} rid The VCs ID
   * @param {string[]} array The array to remove from
   */
export async function removeVc(
    client: ExtendedClient,
    msg: Message,
    rid: string | undefined,
    array: string[]
): Promise<void | Message> {
    const vc = rid ?? "none";

    // Checks if the role they want to add is already added
    if (!array.includes(vc)) {
        return client.reply(msg, { content: `\`<#${vc}>\` is not on the list! ❌` });
    }

    // Checks the location in the array for the role
    const roleIndex = array.indexOf(vc);

    // Removes the role from the array with the index number
    array.splice(roleIndex, 1);
    Storage.saveConfig();

    return client.reply(msg, {
        content:
            `I have removed the vc \`<#${vc}> \` from the list ✅`
    });
}

/**
   * Used to list the roles from an array
   * @param {Message} msg Message instance
   * @param {string[]} array The array to list
   * @param {string} title The list's name
   * @returns {MessageEmbed} Emeded list of roles
   */
export async function listVcs(
    client: ExtendedClient,
    msg: Message,
    array: string[],
    title: string
): Promise<void | Message> {
    if (!array.length) {
        return client.reply(msg, {
            content:
                "The list is currently emtpy! use boostvc add <vcID>"
                + "to add a vc to the list!"
        });
    }

    const roleList = array.map((list) => `○ ${msg.guild?.channels.resolve(list)?.name ?? list}\n`);
    const embed = new MessageEmbed()
        .setAuthor({ "iconURL": msg.author.displayAvatarURL({ dynamic: true }), "name": msg.author.tag })
        .setTitle(title)
        .setTimestamp()
        .setDescription(roleList.join(""));

    try {
        return await client.reply(msg, { embeds: [embed] });
    } catch (_) {
        const roles = roleList.join("");
        return client.reply(msg, { content: `listed Vcs:\n ${roles}` });
    }
}
