import { Event } from "../interfaces";
import { GuildMember } from "discord.js";
import { STORAGE } from "../globals";
import { getChannel } from "../utils/getChannel";


export const event: Event = {
    name: "guildMemberUpdate",
    run: async (client, oldMember: GuildMember, newMember: GuildMember) => {
        const check = newMember.roles.cache.map((role) => role.id);

        // Loop over member roles to check if they have whitelisted roles
        const foundWhitelist = check.some((hasRole) => STORAGE.allowedRoles.includes(hasRole));

        const channel = await getChannel(STORAGE.boosterChannel, newMember.guild);

        if (!channel) return;

        if (!foundWhitelist) {
            // Loop over member roles to check if they have colour roles
            const foundColourRole = check.some((colorRoleId) => STORAGE.colourRoles.includes(colorRoleId));

            if (foundColourRole) {
                STORAGE.colourRoles.forEach(async (role) => {
                    const memberRoles = newMember.roles.cache;
                    const invalidRole = memberRoles.get(role);
                    if (invalidRole) {
                        try {
                            await newMember.roles.remove(role, "Doesn't have required role");
                        } catch {
                            console.log(`Missing perms to remove colour roles from ${newMember.user.tag}`);
                        }
                    }
                });
            }
        }

        if (check.includes(STORAGE.mutedRole)) {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            await channel.permissionOverwrites.create(newMember, { SEND_MESSAGES: false }, { "reason": "User Was muted" });
        }

        if (!check.includes(STORAGE.mutedRole)) {
            const memberPerms = channel.permissionOverwrites.cache.get(newMember.user.id);

            if (memberPerms === undefined) {
                return;
            }

            await memberPerms.delete("No longer muted");
        }
    }
};