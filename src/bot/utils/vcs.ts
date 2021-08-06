import { Message, MessageEmbed } from "discord.js";
import { CommandoMessage } from "discord.js-commando";
import Storage from "../storage";
import { getVc } from "./utils";

/**
 * Used to add a VC to an array
 * @param {CommandoMessage} msg Message instance
 * @param {string} rid The VCs ID
 * @param {string[]} array The array to add to
 */
export async function addVc(
    msg: CommandoMessage,
    rid: string,
    array: string[]
): Promise<Message | Message[]> {
    const vc = getVc(rid, msg.guild);
    if (vc === undefined) {
        return msg.say("Please use the ID of a voice channel");
    }


    const vcID: string = vc.id;

    // Checks if the role they want to add is already added
    if (array.includes(vcID)) {
        return msg.say(`\`${vc.name}\` is already on the list! ❌`);
    }

    // Otherwise finally add it to the list
    array.push(vcID);
    Storage.saveConfig();

    return msg.say(
        `I have added the role \`${vc.name}\` to the list! ✅`
    );
}

/**
   * Used to remove a VC from an array
   * @param {CommandoMessage} msg Message instance
   * @param {string} rid The VCs ID
   * @param {string[]} array The array to remove from
   */
export async function removeVc(
    msg: CommandoMessage,
    rid: string,
    array: string[]
): Promise<Message | Message[]> {
    const vc = getVc(rid, msg.guild);
    // If the first argument is the @everyone id or undefined return
    if (vc === undefined) {
        return msg.say("Please use the ID of a voice channel");
    }

    // Checks if the role they want to add is already added
    if (!array.includes(vc.id)) {
        return msg.say(`\`${vc.name}\` is not on the list! ❌`);
    }

    // Checks the location in the array for the role
    const roleIndex = array.indexOf(vc.id);

    // Removes the role from the array with the index number
    array.splice(roleIndex, 1);
    Storage.saveConfig();

    return msg.say(
        `I have removed the vc \`${vc.name} \` from the list ✅`);
}

/**
   * Used to list the roles from an array
   * @param {CommandoMessage} msg Message instance
   * @param {string[]} array The array to list
   * @param {string} title The list's name
   * @returns {MessageEmbed} Emeded list of roles
   */
export async function listVcs(
    msg: CommandoMessage,
    array: string[],
    title: string
): Promise<Message | Message[]> {
    if (!array.length) {
        return msg.say(
            "The list is currently emtpy! use boostvc add <vcID>"
        + "to add a vc to the list!"
        );
    }

    const roleList = array.map((list) => `○ ${msg.guild.channels.resolve(list)?.name ?? list}\n`);
    const embed = new MessageEmbed()
        .setAuthor(
            msg.author.tag,
            msg.author.displayAvatarURL({ dynamic: true })
        )
        .setTitle(title)
        .setTimestamp()
        .setDescription(roleList.join(""));

    try {
        return msg.say(embed);
    } catch (_) {
        const roles = roleList.join("");
        return msg.say(`listed Vcs:\n ${roles}`);
    }
}
