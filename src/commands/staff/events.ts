import { Command } from "../../interfaces";
import { rolePerms } from "../../globals";

export const command: Command = {
    cooldown: 3,
    description: "Change the mentionability of the events role",
    example: ["!events"],
    group: "staff",
    staffOnly: true,
    guildOnly: true,
    name: "events",
    permissionsBot: rolePerms,
    run: async ({ client, msg }) => {

        try {
            const role = await msg.guild?.roles.fetch("647203800419008533");

            if (!role) return Error();

            if (role.mentionable) {
                await role.setMentionable(false, "Staff set mentionable");
                return await client.embedReply(msg, { embed: { description: `The \`${role.name}\` role is **no longer** mentionable` } }).catch(console.error);
            }

            await role.setMentionable(true, "Staff set mentionable");

            return await client.embedReply(msg, { embed: { description: `The \`${role.name}\` role is **now** mentionable` } }).catch(console.error);


        } catch (err) {
            return await client.embedReply(msg, { embed: { description: "There was an error finding the events role, does it still exist?" } }).catch(console.error);

        }

    }
};
