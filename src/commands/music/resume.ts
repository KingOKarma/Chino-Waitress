import { Command } from "../../interfaces";
import { rolePerms } from "../../globals";


export const command: Command = {
    aliases: ["r"],
    cooldown: 5,
    description: "Resume currently playing music",
    example: ["!resume"],
    group: "music",
    guildOnly: true,
    name: "resume",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg }) => {

        const queue = client.queue.get(msg.guild?.id ?? "");
        if (!queue) return client.embedReply(msg, { embed: { description: "There is nothing playing." } }).catch(console.error);
        if (!client.canModifyQueue(msg.member)) return client.embedReply(msg, { embed: { description: "You need to join a voice channel first!" } }).catch(console.error);

        if (!queue.playing) {
            queue.playing = true;
            queue.audioResource?.audioPlayer?.unpause();
            return client.embedReply(msg, { embed: { description: `${msg.author} ▶ resumed the music!` } }).catch(console.error);
        }

        return client.embedReply(msg, { embed: { description: "The queue is not paused." } }).catch(console.error);
    }
};
