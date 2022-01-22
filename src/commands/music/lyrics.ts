import { Command } from "../../interfaces";
import { MessageEmbed } from "discord.js";
import lyricsFinder from "lyrics-finder";
import { rolePerms } from "../../globals";


export const command: Command = {
    aliases: ["ly"],
    cooldown: 3,
    description: "Get lyrics for the currently playing song",
    example: ["!loop"],
    group: "music",
    guildOnly: true,
    name: "lyrics",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg, args }) => {

        const queue = client.queue.get(msg.guild?.id ?? "");
        if (!queue) return client.embedReply(msg, { embed: { description: "There is nothing playing." } } ).catch(console.error);

        let lyrics = null;
        // eslint-disable-next-line prefer-destructuring
        const { title } = queue.songs[0];

        try {
            lyrics = await lyricsFinder("", queue.songs[0].title);
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (!lyrics) lyrics = args;
            lyrics = await lyricsFinder("", args);
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (!lyrics) lyrics = `No lyrics found for ${queue.songs[0].title}`;
        } catch (error) {
            lyrics = `No lyrics found for ${title}.`;
        }

        const lyricsEmbed = new MessageEmbed()
            .setTitle(`${title} - Lyrics`)
            .setDescription(lyrics)
            .setTimestamp();

        const descLength = lyricsEmbed.description?.length ?? 0;
        if ( descLength >= 2048)
            lyricsEmbed.description = `${lyricsEmbed.description?.substring(0, 2045)}...`;
        return client.embedReply(msg, { embed: lyricsEmbed }).catch(console.error);
    }
};