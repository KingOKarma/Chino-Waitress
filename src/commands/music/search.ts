/* eslint-disable @typescript-eslint/no-explicit-any */
import { CONFIG, rolePerms } from "../../globals";
import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../interfaces";
import { Songs } from "../../interfaces/music/queue";
import Youtube from "simple-youtube-api";
const youtube = new Youtube(CONFIG.music.youtubeAPIKey);


export const command: Command = {
    cooldown: 5,
    description: "Search and select videos to play",
    example: ["!search <Video Name>"],
    group: "music",
    guildOnly: true,
    name: "search",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {

        if (!args.length)
            return client.embedReply(msg, { embed: { description: `Usage: ${command.example[0]}` } }).catch(console.error);

        const collector = client.activeCollector.get(msg.channelId);
        if (collector !== undefined) return client.embedReply(msg, { embed: { description: "A message collector is already active in this channel." } }).catch(console.error);
        if (!msg.member?.voice.channel)
            return client.embedReply(msg, { embed: { description: "You need to join a voice channel first!" } }).catch(console.error);

        const search = args.join(" ");

        const resultsEmbed = new MessageEmbed()
            .setTitle("**Reply with the song number you want to play**")
            .setDescription(`Results for: ${search}`);

        try {
            const results: Songs[] = await youtube.searchVideos(search, 10);
            results.map((video, index) => resultsEmbed.addField(video.shortURL ?? "", `${index + 1}. ${video.title}`));

            const resultsMessage = await client.embedReply(msg, { embed: resultsEmbed }).catch(console.error);

            if (!(resultsMessage instanceof Message)) return await client.embedReply(msg, { embed: { description: "Internal error, Message != Message(?)" } });
            // eslint-disable-next-line @typescript-eslint/no-shadow
            function filter(msg: any): boolean {
                const pattern = /^[1-9][0]?(\s*,\s*[1-9][0]?)*$/;
                return pattern.test(msg.content);
            }

            client.activeCollector.set(msg.channelId, true);
            const response = await msg.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ["time"] });
            const res = response.first();
            if (res === undefined) return await client.embedReply(msg, { embed: { description: "Internal error" } }).catch(console.error);
            const reply = res.content;

            if (reply.includes(",")) {
                const songs = reply.split(",").map((str) => str.trim());

                for (const song of songs) {
                    const playCmd = client.commands.get("play");
                    if (!playCmd) return await client.embedReply(msg, { embed: { description: "Internal error Play command does not exist" } }).catch(console.error);
                    playCmd.run(client, msg, [resultsEmbed.fields[parseInt(song, 10) - 1].name]);
                }
            } else {
                const choice = resultsEmbed.fields[parseInt(reply, 10) - 1].name;
                const playCmd = client.commands.get("play");
                if (!playCmd) return await client.embedReply(msg, { embed: { description: "Internal error Play command does not exist" } }).catch(console.error);
                playCmd.run(client, msg, [choice]);
            }

            client.activeCollector.set(msg.channelId, false);
            resultsMessage.delete().catch(console.error);
            res.delete().catch(console.error);
        } catch (error: any) {
            console.error(error);
            client.activeCollector.set(msg.channelId, false);
            client.embedReply(msg, { embed: { description: `Error:\n${error.message}` } }).catch(console.error);
        }
    }
};
