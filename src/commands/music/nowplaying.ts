import { Command } from "../../interfaces";
import { MessageEmbed } from "discord.js";
import { rolePerms } from "../../globals";
import { splitBar } from "string-progressbar";


export const command: Command = {
    aliases: ["np"],
    cooldown: 3,
    description: "Show now playing song",
    example: ["!nowplaying"],
    group: "music",
    guildOnly: true,
    name: "nowplaying",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {

        const queue = client.queue.get(msg.guild?.id ?? "");
        if (!queue || !queue.songs.length) return client.embedReply(msg, { embed: { description: "There is nothing playing." } }).catch(console.error);
        if (!queue.audioResource) return client.embedReply(msg, { embed: { description: "There is nothing playing." } }).catch(console.error);

        const [song] = queue.songs;
        const seek = queue.audioResource.playbackDuration / 1000;
        const duration = Number(song.duration);
        const left = duration - seek;

        const nowPlaying = new MessageEmbed()
            .setTitle("Now playing")
            .setDescription(`${song.title}\n${song.url}`);

        if (duration > 0) {
            nowPlaying.addField(
                "\u200b",
                `${new Date(seek * 1000).toISOString().substring(19, 14)
                } [${splitBar(duration === 0 ? seek : duration, seek, 20)[0]
                }] ${duration === 0 ? " ◉ LIVE" : new Date(duration * 1000).toISOString().substring(19, 14)}`,
                false
            );
            nowPlaying.setFooter(
                {
                    "text": `Time Remaining: ${new Date(left * 1000).toISOString().substring(19, 14)}`
                }
            );
        }

        return client.embedReply(msg, { embed: nowPlaying });
    }
};
