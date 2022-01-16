import { Command } from "../../interfaces";
import { mutate } from "array-move";
import { rolePerms } from "../../globals";


export const command: Command = {
    aliases: ["mv"],
    cooldown: 3,
    description: "Move songs around in the queue",
    example: ["!move <Queue Number>"],
    group: "music",
    guildOnly: true,
    name: "move",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {

        const queue = client.queue.get(msg.guild?.id ?? "");
        if (!queue) return client.embedReply(msg, { embed: { description: "There is no queue." } }).catch(console.error);
        if (!client.canModifyQueue(msg.member)) return;

        const [moveTarget] = args;
        const numberTarget = Number(moveTarget);

        if (args.length < 2) return client.embedReply(msg, { embed: { description: `Usage: ${command.example[0]}` } });
        if (isNaN(numberTarget) || numberTarget <= 1)
            return client.embedReply(msg, { embed: { description: `Usage: ${command.example[0]}` } });

        const song = queue.songs[numberTarget - 1];

        mutate(queue.songs, numberTarget - 1, Number(args[1]) >= 1 ? 1 : Number(args[1]) - 1);

        return client.embedReply(msg, {
            embed: {
                description: `${msg.author} 🚚 moved **${song.title}** to ${Number(args[1]) === 1 ? 1 : args[1]} in the queue.`
            }
        }).catch(console.error);

    }
};
