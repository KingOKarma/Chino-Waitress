import { CONFIG, rolePerms } from "../../globals";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import { MessageEmbed, TextChannel } from "discord.js";
import { Queue, Songs } from "../../interfaces/music/queue";
import { Command } from "../../interfaces";
import YouTube from "simple-youtube-api";
import { play } from "./play/play";
import scdl from "soundcloud-downloader";

// const { play } = require("../include/play");
const youtube = new YouTube(CONFIG.music.youtubeAPIKey);


export const command: Command = {
    aliases: ["pl"],
    cooldown: 5,
    description: "Play a playlist from youtube",
    example: ["!playlist <Youtube Playlist URL | Playlist Name>"],
    group: "music",
    guildOnly: true,
    name: "playlist",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg, args }) => {

        const { guild } = msg;
        if (!msg.member) return client.embedReply(msg, { embed: { description: "There was an internal error" } });
        if (!guild) return client.embedReply(msg, { embed: { description: "There was an internal error" } });
        if (!guild.me) return client.embedReply(msg, { embed: { description: "There was an internal error" } });

        const { channel } = msg.member.voice;
        const serverQueue = client.queue.get(guild.id);

        if (!args.length)
            return client.embedReply(msg, { embed: { description: `Usage: ${command.example[0]}` } }).catch(console.error);

        if (!channel) return client.embedReply(msg, { embed: { description: "You need to join a voice channel first!" } }).catch(console.error);

        const permissions = channel.permissionsFor(guild.me);
        if (!permissions.has("CONNECT")) return client.embedReply(msg, { embed: { description: "Cannot connect to voice channel, missing permissions" } });
        if (!permissions.has("SPEAK")) return client.embedReply(msg, { embed: { description: "I cannot speak in this voice channel, make sure I have the proper permissions!" } });

        if (serverQueue && channel !== guild.me.voice.channel)
            return client.embedReply(msg, { embed: { description: `You must be in the same channel as ${msg.client.user}` } }).catch(console.error);

        const search = args.join(" ");
        const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi;
        const [url] = args;
        const urlValid = pattern.test(args[0]);

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

        let playlist = null;
        let videos = [];

        if (urlValid) {
            try {
                playlist = await youtube.getPlaylist(url, { part: "snippet" });
                videos = await playlist.getVideos(CONFIG.music.maxPlaylistSize || 10, { part: "snippet" });
            } catch (error) {
                console.error(error);
                return client.embedReply(msg, { embed: { description: "Playlist not found :(" } }).catch(console.error);
            }
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        } else if (scdl.isValidUrl(args[0])) {
            if (args[0].includes("/sets/")) {
                await client.embedReply(msg, { embed: { description: "⌛ fetching the playlist..." } });
                playlist = await scdl.getSetInfo(args[0], CONFIG.music.soundcloudAPIKey);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                videos = playlist.tracks.map((track: Songs) => {
                    return {

                        title: track.title,
                        url: track.permalink_url,
                        duration: track.duration / 1000
                    };
                });
            }
        } else {
            try {
                const results = await youtube.searchPlaylists(search, 1, { part: "id" });
                [playlist] = results;
                videos = await playlist.getVideos(CONFIG.music.maxPlaylistSize, { part: "snippet" });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.error(error);
                return msg.reply(error.message).catch(console.error);
            }
        }

        const newSongs: Songs[] = videos
            .filter((video: Songs) => video.title !== "Private video" && video.title !== "Deleted video")
            .map((video: Songs) => {
                const song: Songs = {
                    title: video.title,
                    url: video.url,
                    duration: video.durationSeconds ?? 0
                };
                return song;
            });

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        serverQueue ? serverQueue.songs.push(...newSongs) : queueConstruct.songs.push(...newSongs);

        const playlistEmbed = new MessageEmbed()
            .setTitle(`${playlist.title}`)
            .setDescription(newSongs.map((song, index) => `${index + 1}. ${song.title}`).join("\n"))
            .setURL(playlist.url)
            .setTimestamp();

        if (playlistEmbed.description === null) return client.embedReply(msg, { embed: { description: "Internal Error" } });
        if (playlistEmbed.description.length >= 2048)
            playlistEmbed.description =
                `${playlistEmbed.description.substring(0, 2007)}\nPlaylist larger than character limit...`;

        await client.embedReply(msg, { content: `${msg.author} Started a playlist`, embed: playlistEmbed });

        if (!serverQueue) {

            try {
                queueConstruct.connection = joinVoiceChannel({
                    "channelId": channel.id,
                    "guildId": guild.id,
                    "adapterCreator": guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
                });
                client.queue.set(guild.id, queueConstruct);

                await play(queueConstruct.songs[0], msg, false, client);

            } catch (error) {
                client.queue.delete(guild.id);
                console.error(error);
                return client.embedReply(msg, { embed: { description: `I Could not join the channel, \n ${error}` } });
            }
        }
    }
};
