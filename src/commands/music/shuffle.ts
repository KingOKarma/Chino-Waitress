import { Command } from "../../interfaces";
import { rolePerms } from "../../globals";


export const command: Command = {
    cooldown: 5,
    description: "Shuffle queue",
    djMode: true,
    example: ["!shuffle"],
    group: "music",
    guildOnly: true,
    name: "shuffle",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg }) => {

        const queue = client.queue.get(msg.guild?.id ?? "");
        if (!queue) return client.embedReply(msg, { embed: { description: "There is no queue." } }).catch(console.error);
        if (!client.canModifyQueue(msg.member)) return client.embedReply(msg, { embed: { description: `${msg.author} You need to join a voice channel first!` } }).catch(console.error);


        const { songs } = queue;
        for (let i = songs.length - 1; i > 1; i--) {
            const j = 1 + Math.floor(Math.random() * i);
            [songs[i], songs[j]] = [songs[j], songs[i]];
        }
        queue.songs = songs;
        client.queue.set(msg.guild?.id ?? "", queue);
        client.embedReply(msg, { embed: { description: `${msg.author} 🔀 shuffled the queue` } }).catch(console.error);
    }
};
