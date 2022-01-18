import { Command } from "../../interfaces";
import { rolePerms } from "../../globals";


export const command: Command = {
    cooldown: 3,
    description: "Pause the currently playing music",
    example: ["!pause"],
    group: "music",
    guildOnly: true,
    name: "pause",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg }) => {

        const queue = client.queue.get(msg.guild?.id ?? "");
        if (!queue) return client.embedReply(msg, { embed: { description: "There is nothing playing." } }).catch(console.error);
        if (!client.canModifyQueue(msg.member)) return client.embedReply(msg, { embed: { description: "You need to join a voice channel first!" } });

        if (queue.playing) {
            try {
                queue.audioResource?.audioPlayer?.pause(true);
                queue.playing = false;
            } catch (err) {
                return client.embedReply(msg, { embed: { description: "I was unable to pause the music!" } });
            }
            return client.embedReply(msg, { embed: { description: `${msg.author} ⏸ paused the music.` } }).catch(console.error);

        }
    }
};
