import { Command } from "../../interfaces";
import { rolePerms } from "../../globals";


export const command: Command = {
    aliases: ["st"],
    cooldown: 3,
    description: "Skip to the selected queue number",
    djMode: true,
    example: ["!skipto <Queue Number>"],
    group: "music",
    guildOnly: true,
    name: "skipto",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg, args }) => {

        if (!args.length || isNaN(Number(args[0])))
            return client.embedReply(msg, { embed: { description: `Usage ${command.example[0]}` } }).catch(console.error);

        const queue = client.queue.get(msg.guild?.id ?? "");
        if (!queue) return client.embedReply(msg, { embed: { description: "There is no queue." } }).catch(console.error);
        if (!client.canModifyQueue(msg.member)) return client.embedReply(msg, { embed: { description: `${msg.author} You need to join a voice channel first!` } }).catch(console.error);
        if (Number(args[0]) > queue.songs.length)
            return client.embedReply(msg, { embed: { description: `The queue is only ${queue.songs.length} songs long!` } }).catch(console.error);

        queue.playing = true;

        if (queue.loop) {
            for (let i = 0; i < Number(args[0]) - 2; i++) {
                const oldSong = queue.songs.shift();
                if (oldSong)
                    queue.songs.push(oldSong);
            }
        } else {
            queue.songs = queue.songs.slice(Number(args[0]) - 2);
        }

        queue.audioResource?.audioPlayer?.stop();
        return client.embedReply(msg, { embed: { description: `${msg.author} ⏭ skipped ${Number(args[0]) - 1} songs` } }).catch(console.error);
    }
};
