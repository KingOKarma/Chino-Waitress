import { Command } from "../../interfaces";
import { Songs } from "../../interfaces/music/queue";
import { rolePerms } from "../../globals";

const pattern = /^[0-9]{1,2}(\s*,\s*[0-9]{1,2})*$/;


export const command: Command = {
    aliases: ["rm"],
    cooldown: 5,
    description: "Remove song from the queue",
    example: ["!remove <Queue Number>"],
    group: "music",
    guildOnly: true,
    name: "remove",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {

        const queue = client.queue.get(msg.guild?.id ?? "");

        if (!queue) return client.embedReply(msg, { embed: { description: "There is no queue." } }).catch(console.error);
        if (!client.canModifyQueue(msg.member)) return client.embedReply(msg, { embed: { description: "You need to join a voice channel first!" } }).catch(console.error);
        if (!args.length) return client.embedReply(msg, { embed: { description: `Usage: ${command.example[0]}` } });

        const argus = args.join("");
        const songs = argus.split(",").map((arg) => parseInt(arg, 10));
        const removed: Songs[] = [];

        if (pattern.test(argus)) {
            queue.songs = queue.songs.filter((item, index) => {
                if (songs.find((songIndex) => songIndex - 1 === index) !== undefined) {
                    removed.push(item);
                    return false;
                }
                return true;
            });

            return client.embedReply(msg, { embed: { description: `${msg.author} ❌ removed **${removed.map((song) => song.title).join("\n")}** from the queue.` } }).catch(console.error);

        } else if (!isNaN(Number(args[0])) && Number(args[0]) >= 1 && Number(args[0]) <= queue.songs.length) {
            return client.embedReply(msg, { embed: { description: `${msg.author} ❌ removed **${queue.songs.splice(Number(args[0]) - 1, 1)[0].title}** from the queue.` } }).catch(console.error);

        }
        return client.embedReply(msg, { embed: { description: `Usage: ${command.example[0]}` } }).catch(console.error);

    }
};
