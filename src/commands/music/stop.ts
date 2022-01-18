import { CONFIG, rolePerms } from "../../globals";
import { Command } from "../../interfaces";


export const command: Command = {
    cooldown: 3,
    description: "Stops the music",
    example: [`${CONFIG.prefix}stop`],
    group: "music",
    guildOnly: true,
    name: "stop",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg }) => {

        const queue = client.queue.get(msg.guild?.id ?? "");

        if (!queue) return client.embedReply(msg, { embed: { description: "There is nothing playing." } }).catch(console.error);
        if (!client.canModifyQueue(msg.member)) return client.embedReply(msg, { embed: { description: `${msg.author} You need to join a voice channel first!` } }).catch(console.error);

        queue.songs = [];
        queue.connection?.destroy();
        client.queue.delete(msg.guild?.id ?? "");
        return client.embedReply(msg, { embed: { description: `${msg.author} ⏹ stopped the music!` } }).catch(console.error);
    }
};
