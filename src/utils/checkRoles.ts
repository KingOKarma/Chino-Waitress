import { GuildMember } from "discord.js";

/**
 * Used to check if a user has at least one role from a list, returns true if found
 * @param {GuildMember} member The member instance
 * @param {string[]} array the array of role ID's to check through
 * @returns {boolean} true or false
 */
export function checkRoles(
    member: GuildMember | null,
    array: string[]
): boolean {
    if (!member) return false;

    const check = member.roles.cache.map((role) => role.id);

    // Loop over member roles to check if they have whitelisted roles
    const foundList = check.some((roleList) => array.includes(roleList));

    if (foundList) {
        return true;
    }
    return false;
}