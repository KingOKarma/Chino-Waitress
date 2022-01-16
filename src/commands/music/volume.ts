import { Command } from "../../interfaces";
import { rolePerms } from "../../globals";


export const command: Command = {
    aliases: ["v"],
    cooldown: 3,
    description: "Change volume of currently playing music",
    example: ["!stop"],
    group: "music",
    guildOnly: true,
    name: "volume",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {

        const queue = client.queue.get(msg.guild?.id ?? "");

        if (!queue) return client.embedReply(msg, { embed: { description: "There is nothing playing." } }).catch(console.error);
        if (!client.canModifyQueue(msg.member)) return client.embedReply(msg, { embed: { description: `${msg.author} You need to join a voice channel first!` } }).catch(console.error);

        if (!args[0])
            return client.embedReply(msg, { embed: { description:`🔊 The current volume is: **${queue.volume}%**` } }).catch(console.error);

        if (isNaN(Number(args[0]))) return client.embedReply(msg, { embed: { description: "Please use a number to set volume." } }).catch(console.error);

        if (Number(args[0]) > 100 || Number(args[0]) < 0)
            return client.embedReply(msg, { embed: { description: "Please use a number between 0 - 100." } }).catch(console.error);

        queue.volume = Number(args[0]);
        queue.audioResource?.volume?.setVolumeLogarithmic(Number(args[0]) / 100);
        return client.embedReply(msg, { embed: { description: `Volume set to: **${args[0]}%**` } }).catch(console.error);
    }
};
