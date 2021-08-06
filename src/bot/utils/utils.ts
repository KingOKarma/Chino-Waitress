/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
    Client, Emoji, Guild, GuildMember, Role, User, VoiceChannel
} from "discord.js";
import { ItemMeta } from "../../entity/item";
import { User as entityUser } from "../../entity/user";

/**
 * Used to check role mentions/ID's if they are roles
 * @param {string} rid The role mention/ID (Optional)
 * @param {Guild} guild the Guild instance the of where the Role is from
 * @returns {Role} A Role instance or undefined
 */
export function getRole(rid: string, guild: Guild): Role | undefined {
    let ridParsed = rid;
    // Check if a role was tagged or not. If the role was tagged remove the
    // Tag from rid.
    if (rid.startsWith("<@&") && rid.endsWith(">")) {
        const re = new RegExp("[<@&>]", "g");
        ridParsed = rid.replace(re, "");
    }
    // Try recovering the role and report if it was successful or not.
    try {
        return guild.roles.cache.get(ridParsed);
    } catch (e) {
        console.log(`Role not found because ${e}`);
        return undefined;
    }
}

/**
 * Used to check member mentions/ID's if they are roles
 * @param {string} uid The Member's ID
 * @param {Guild} guild the Guild instance the of where the Member is from
 * @returns {GuildMember} A Member instance from a server
 */
export async function getMember(uid: string, guild: Guild): Promise<GuildMember | null> {
    let uidParsed = uid;
    // Check if a member was tagged or not. If the member was tagged remove the
    // Tag from uid.
    if (uid.startsWith("<@") && uid.endsWith(">")) {
        const re = new RegExp("[<@!>]", "g");
        uidParsed = uid.replace(re, "");
    }

    if (uidParsed.length !== 18) {
        return null;
    }
    // Try recovering the role and report if it was successful or not.
    try {
        return await guild.members.fetch(uidParsed);
    } catch (e) {
        console.log(`Member not found because ${e}`);
        return null;
    }
}

/**
 * Used to check member mentions/ID's if they are roles
 * @param {string} uid The User's ID
 * @param {Guild} client  The Message Instance
 * @returns {GuildMember} A Member instance from a server
 */
export async function getUser(uid: string, client: Client): Promise<User | undefined> {
    let uidParsed = uid;
    // Check if a member was tagged or not. If the member was tagged remove the
    // Tag from uid.
    if (uid.startsWith("<@") && uid.endsWith(">")) {
        const re = new RegExp("[<@!>]", "g");
        uidParsed = uid.replace(re, "");
    }
    // Try recovering the role and report if it was successful or not.
    try {
        return await client.users.fetch(uidParsed);
    } catch (e) {
        console.log(`User not found because ${e}`);
        return undefined;
    }
}

/**
 * Used to check channel mentions/ID's if they are roles
 * @param {string} rid The role mention/ID (Optional)
 * @param {Guild} guild the Guild instance the of where the Role is from
 * @returns {Role} A Role instance or undefined
 */
export function getVc(rid: string, guild: Guild): VoiceChannel | undefined {

    return guild.channels.cache.get(rid) as VoiceChannel | undefined;

}


/**
 * Used to check if a user has at least one role from a list, returns true if found
 * @param {GuildMember} member The member instance
 * @param {string[]} array the array of role ID's to check through
 * @returns {boolean} true or false
 */
export function checkRoles(
    member: GuildMember,
    array: string[]
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
 * Used to check if a user has at least one role from a list, returns true if found
 * @param {string} emoteString The raw emote string
 * @param {Client} client The client that is initialised
 * @returns {Emoji | undefined} Either returns the emote or undefiend
 */
export function getEmote(emoteString: string, client: Client): Emoji | undefined {
    // eslint-disable-next-line no-useless-escape
    if (!emoteString.match(/\:(.*?)\>/g)) {
        return undefined;
    }

    // eslint-disable-next-line no-useless-escape
    const findEmote = emoteString.slice(3).match(/\:.*?\>/g);
    if (findEmote === null) {
        return undefined;
    }

    const theMatch = findEmote[0].slice(1, -1);

    const emote = client.emojis.cache.get(theMatch);

    if (emote) {
        return emote;
    }

    return undefined;
}

/**
 * Used to create pages from a user entity
 * @param {Array} array The array to page
 * @param {number} pageSize How big are each of the pages?
 * @param {number} pageNumber Which Page number do you wish to be on?
 * @returns {Array} an array
 */
export function userpaginate(array: entityUser[], pageSize: number, pageNumber: number): entityUser[] {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}

/**
 * Used to create pages from a shop entity
 * @param {Array} array The array to page
 * @param {number} pageSize How big are each of the pages?
 * @param {number} pageNumber Which Page number do you wish to be on?
 * @returns {Array} an array
 */
export function shoppaginate(array: ItemMeta[], pageSize: number, pageNumber: number): ItemMeta[] {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}

/**
 * Used to create pages from a string array
 * @param {Array} array The array to page
 * @param {number} pageSize How big are each of the pages?
 * @param {number} pageNumber Which Page number do you wish to be on?
 * @returns {Array} an array
 */
export function stringpaginate(array: string[], pageSize: number, pageNumber: number): string[] {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}

/**
 * Wait in miliseconds
 * @param {number} milliseconds The time in mlliseconds to wait
 */
export function sleep(milliseconds: number): void {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

/**
 * Get random number between 2 integers
 * @param {number} max The highest possible number
 * @param {number} min The lowest possible number
 * @returns {number} a random number between max and min
 */
export function ranNum(max: number, min: number): number {
    return Math.floor(Math.random() * max + min);
}

/**
 * Get random item from an array
 * @param {Array} array The array to get random item from
 * @returns {unknown} A random item from an array
 */
export function ranArray(array: unknown[]): unknown {
    return array[Math.floor(Math.random() * array.length)];
}
