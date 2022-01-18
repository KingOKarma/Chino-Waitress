import { Command } from "../../interfaces";
import { rolePerms } from "../../globals";


export const command: Command = {
    aliases: ["s"],
    cooldown: 3,
    description: "Skip the currently playing song",
    example: ["!skip"],
    group: "music",
    guildOnly: true,
    name: "skip",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg }) => {

        const queue = client.queue.get(msg.guild?.id ?? "");
        if (!queue) return client.embedReply(msg, { embed: { description: "There is nothing playing that I could skip for you." } }).catch(console.error);
        if (!client.canModifyQueue(msg.member)) return client.embedReply(msg, { embed: { description: `${msg.author} You need to join a voice channel first!` } }).catch(console.error);

        queue.playing = true;
        queue.audioResource?.audioPlayer?.stop();
        client.embedReply(msg, { embed: { description: `${msg.author} ⏭ skipped the song` } }).catch(console.error);
    }
};
