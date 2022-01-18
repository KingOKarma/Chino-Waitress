import { Command } from "../../interfaces";
import { rolePerms } from "../../globals";


export const command: Command = {
    aliases: ["l"],
    cooldown: 3,
    description: "Toggle music loop",
    example: ["!loop"],
    group: "music",
    guildOnly: true,
    name: "loop",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg }) => {

        const queue = client.queue.get(msg.guild?.id ?? "");
        if (!queue) return client.embedReply(msg, { embed: { description: "There is nothing playing." } }).catch(console.error);
        if (!client.canModifyQueue(msg.member)) client.embedReply(msg, { embed: { description: "You need to join a voice channel first!" } }).catch(console.error);

        queue.loop = !queue.loop;

        return client.embedReply(msg, { embed: { description: `Loop is now ${queue.loop ? "**on**" : "**off**"}` } }).catch(console.error);

    }
};
