/* eslint-disable @typescript-eslint/no-explicit-any */
import { CONFIG, rolePerms } from "../../globals";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import { Queue, Songs } from "../../interfaces/music/queue";
import { Command } from "../../interfaces";
import { TextChannel } from "discord.js";
import Youtube from "simple-youtube-api";
import https from "https";
// import { play } from "../include/play";
import { play } from "./play/play";
import scdl from "soundcloud-downloader";

import ytdl from "ytdl-core";

const youtube = new Youtube(CONFIG.music.youtubeAPIKey);

export const command: Command = {
    aliases: ["p"],
    cooldown: 3,
    description: "Plays audio from YouTube or Soundcloud",
    djMode: true,
    example: ["!play <YouTube URL | Video Name | Soundcloud URL"],
    group: "music",
    guildOnly: true,
    name: "play",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg, args }) => {

        const { guild } = msg;
        if (!msg.member) return client.embedReply(msg, { embed: { description: "There was an internal error" } });
        if (!guild) return client.embedReply(msg, { embed: { description: "There was an internal error" } });
        if (!guild.me) return client.embedReply(msg, { embed: { description: "There was an internal error" } });

        const { channel } = msg.member.voice;


        const serverQueue = client.queue.get(guild.id);

        if (!channel) return client.embedReply(msg, { embed: { description: "You need to join a voice channel first!" } }).catch(console.error);

        if (serverQueue && channel !== guild.me.voice.channel)
            return client.embedReply(msg, { embed: { description: `You must be in the same channel as ${msg.client.user}` } }).catch(console.error);


        if (!args.length)
            return client.embedReply(msg, { embed: { description: "Usage: !play <YouTube URL | Video Name | Soundcloud URL>" } }).catch(console.error);

        const permissions = channel.permissionsFor(guild.me);
        if (!permissions.has("CONNECT")) return client.embedReply(msg, { embed: { description: "Cannot connect to voice channel, missing permissions" } });
        if (!permissions.has("SPEAK")) return client.embedReply(msg, { embed: { description: "I cannot speak in this voice channel, make sure I have the proper permissions!" } });

        const search = args.join(" ");
        const videoPattern = /^(https?:\/\/)?(www\.)?(m\.|music\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
        const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
        const scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
        const mobileScRegex = /^https?:\/\/(soundcloud\.app\.goo\.gl)\/(.*)$/;
        const [url] = args;
        const urlValid = videoPattern.test(args[0]);

        const playlistCmd = client.commands.get("playlist");

        if (!playlistCmd) return client.embedReply(msg, { embed: { description: "There was an internal error" } });

        await scdl.setClientID(CONFIG.music.soundcloudAPIKey);
        // Start the playlist if playlist url was provided
        if (!videoPattern.test(args[0]) && playlistPattern.test(args[0])) {
            return void playlistCmd.run({ client, msg, args });
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        } else if (scdl.isValidUrl(url) && url.includes("/sets/")) {
            return void playlistCmd.run({ client, msg, args });
        }

        if (mobileScRegex.test(url)) {
            try {
                https.get(url, (res) => {
                    if (res.statusCode === 302) {
                        const playCmd = client.commands.get("play");
                        if (!playCmd) return client.embedReply(msg, { embed: { description: "There was an internal error" } });

                        return void playCmd.run({ client, msg, args: [res.headers.location ?? "404"] });
                    }
                    return client.embedReply(msg, { embed: { description: "Audio Not Found" } }).catch(console.error);

                });
            } catch (error: any) {
                console.error(error.message);
                return client.embedReply(msg, { embed: { description: error.message } }).catch(console.error);
            }
            return client.embedReply(msg, { embed: { description: "Following url redirection..." } }).catch(console.error);
        }

        const audioResource = null;
        const queueConstruct: Queue = {
            textChannel: msg.channel as TextChannel,
            channel,
            connection: null,
            songs: [],
            loop: false,
            volume: CONFIG.music.volume,
            muted: false,
            playing: true,
            audioResource
        };

        let songInfo = null;
        let song: Songs | null = null;

        if (urlValid) {
            try {
                songInfo = await ytdl.getInfo(url);
                songInfo.videoDetails.thumbnails.pop();
                song = {
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                    duration: Number(songInfo.videoDetails.lengthSeconds),
                    thumbnail: songInfo.videoDetails.thumbnails.pop()?.url ?? ""

                };
            } catch (error: any) {
                console.error(error);
                return client.embedReply(msg, { embed: { description: "Unable to use soundcloud link" } }).catch(console.error);
            }
        } else if (scRegex.test(url)) {
            try {
                const trackInfo = await scdl.getInfo(url);
                song = {
                    title: trackInfo.title ?? "Not found",
                    url: trackInfo.permalink_url ?? "Not found",
                    duration: Math.ceil(trackInfo.duration ?? 0 / 1000)
                };
            } catch (error: any) {
                console.error(error);
                return client.embedReply(msg, { embed: { description: error.msg } }).catch(console.error);
            }
        } else {
            try {
                const results = await youtube.searchVideos(search, 1, { part: "id" });

                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                if (!results.length) {
                    client.embedReply(msg, { embed: { description: "Audio Not Found" } }).catch(console.error);
                    return;
                }

                songInfo = await ytdl.getInfo(results[0].url);
                songInfo.videoDetails.thumbnails.pop();
                song = {
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                    duration: Number(songInfo.videoDetails.lengthSeconds),
                    thumbnail: songInfo.videoDetails.thumbnails.pop()?.url ?? ""
                };

            } catch (error: any) {
                console.error(error);

                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                if (error.msg.includes("410")) {
                    return client.embedReply(msg, { embed: { description: "Video is age restricted, private or unavailable" } }).catch(console.error);
                }
                return client.embedReply(msg, { embed: { description: error.msg } }).catch(console.error);

            }
        }

        if (serverQueue) {
            serverQueue.songs.push(song);
            return client.embedReply(msg, { embed: { description: `✅ **[${song.title}](${song.url})** has been added to the queue by ${msg.author}`, image: { url: song.thumbnail ?? "" } } }).catch(console.error);
        }

        queueConstruct.songs.push(song);

        try {
            queueConstruct.connection = joinVoiceChannel({
                "channelId": channel.id,
                "guildId": guild.id,
                "adapterCreator": guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
            });
            client.queue.set(guild.id, queueConstruct);

            return await play(song, msg, false, client);

        } catch (error) {
            client.queue.delete(guild.id);
            console.error(error);
            return client.embedReply(msg, { embed: { description: `I Could not join the channel, \n ${error}` } });
        }

    }
};
