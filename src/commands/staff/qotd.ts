import { Command } from "../../interfaces";
import { rolePerms } from "../../globals";

export const command: Command = {
    cooldown: 3,
    description: "Change the mentionability of the qotd role",
    example: ["!uptime"],
    group: "staff",
    staffOnly: true,
    guildOnly: true,
    name: "qotd",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg }) => {

        try {
            const role = await msg.guild?.roles.fetch("659832384874741800");

            if (!role) return Error();

            if (role.mentionable) {
                await role.setMentionable(false, "Staff set mentionable");
                return await client.embedReply(msg, { embed: { description: `The \`${role.name}\` role is **no longer** mentionable` } }).catch(console.error);
            }

            await role.setMentionable(true, "Staff set mentionable");

            return await client.embedReply(msg, { embed: { description: `The \`${role.name}\` role is **now** mentionable` } }).catch(console.error);


        } catch (err) {
            return await client.embedReply(msg, { embed: { description: "There was an error finding the qotd role, does it still exist?" } }).catch(console.error);

        }

    }
};
