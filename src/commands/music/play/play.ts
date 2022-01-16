/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/default-param-last */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { GuildMember, Message } from "discord.js";
import { createAudioPlayer, createAudioResource, getVoiceConnection } from "@discordjs/voice";
import { CONFIG } from "../../../globals";
import ExtendedClient from "../../../client/client";
import { Songs } from "../../../interfaces/music/queue";
import scdl from "soundcloud-downloader";
import ytdl from "ytdl-core-discord";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function play(song?: Songs, message?: Message, silent = false, client?: ExtendedClient): Promise<void | Message> {
    if (!message) return;
    if (!client) return;

    const { guild } = message;
    if (!message.member) return client.embedReply(message, { embed: { description: "There was an internal error" } });
    if (!guild) return client.embedReply(message, { embed: { description: "There was an internal error" } });
    if (!guild.me) return client.embedReply(message, { embed: { description: "There was an internal error" } });


    const PRUNING = CONFIG.music.pruning;

    const queue = client.queue.get(guild.id);

    if (!queue) return client.embedReply(message, { embed: { description: "There was an internal error" } }).catch(console.error);

    if (!song) {
        setTimeout(() => {
            if (!guild.me) return client.embedReply(message, { embed: { description: "There was an internal error" } });

            if (getVoiceConnection(guild.id))
                queue.connection?.destroy();

            !PRUNING && client.embedReply(message, { embed: { description: "Leaving voice channel..." } }).catch(console.error);

        }, CONFIG.music.stayTime * 1000);
        !PRUNING && client.embedReply(message, { embed: { description: "❌ Music queue ended." } }).catch(console.error);
        client.queue.delete(guild.id);
        return;
    }

    let stream = null;

    try {
        if (song.url.includes("youtube.com")) {
            stream = await ytdl(song.url, { highWaterMark: 1 << 25 });
        } else if (song.url.includes("soundcloud.com")) {
            try {
                stream = await scdl.downloadFormat(song.url, scdl.FORMATS.OPUS, CONFIG.music.soundcloudAPIKey);
            } catch (error) {
                stream = await scdl.downloadFormat(song.url, scdl.FORMATS.MP3, CONFIG.music.soundcloudAPIKey);
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (queue) {
            queue.songs.shift();
            return play(queue.songs[0], message, false, client);
        }

        console.error(error);
        return client.embedReply(message, { embed: { description: `Error: ${error.message ? error.message : error}` } }).catch(console.error);
    }

    try {

        if (!queue.connection) return await client.embedReply(message, { embed: { description: "There was an internal error" } }).catch(console.error);


        const player = createAudioPlayer();
        const resource = createAudioResource(stream, { "inlineVolume": true });
        queue.audioResource = resource;

        queue.connection.subscribe(player);

        queue.audioResource.volume?.setVolumeLogarithmic(queue.volume / 100);


        player.play(resource);

        player.on("stateChange", async (oldState, newState) => {
            if (newState.status === "autopaused") {
                setTimeout(() => {
                    if (queue.audioResource?.ended) {

                        try {
                            if (getVoiceConnection(guild.id)) {
                                queue.connection?.destroy();
                                client.queue.delete(guild.id);

                            }

                        } catch (err) {
                            console.error(err);
                        }

                    }
                }, 5000);
            }

            if (oldState.status === "playing" && newState.status === "idle") {

                setTimeout(() => {

                    // Check if there is anything playing, if not leave
                    if (queue.audioResource?.ended) {
                        try {
                            if (getVoiceConnection(guild.id))
                                queue.connection?.destroy();

                        } catch (err) {
                            console.error(err);
                        }
                        client.queue.delete(guild.id);

                    }

                }, CONFIG.music.stayTime * 1000);


                // Play song, play nothing if nothing left in queue
                if (queue.loop) {
                    // if loop is on, push the song back at the end of the queue
                    // so it can repeat endlessly
                    const lastSong = queue.songs.shift();
                    if (!lastSong) return;
                    queue.songs.push(lastSong);
                    await play(queue.songs[0], message, queue.songs[0].url === lastSong.url, client);
                } else {
                    // Recursively play the next song
                    queue.songs.shift();

                    await play(queue.songs[0], message, false, client);

                }


            }
        });

    } catch (err) {
        // Recursively play the next song
        queue.songs.shift();
        return play(queue.songs[0], message, false, client);
    }


    if (!silent) {
        let playingMessage: Message | undefined;
        try {
            playingMessage = await queue.textChannel.send({
                embeds: [{
                    description: `🎶 Started playing: **[${song.title}](${song.url})**`,
                    image: { url: song.thumbnail ?? "" },
                    color: client.primaryColour
                }]
            }
            );

            await playingMessage.react("⏭");
            await playingMessage.react("⏯");
            await playingMessage.react("🔇");
            await playingMessage.react("🔉");
            await playingMessage.react("🔊");
            await playingMessage.react("🔁");
            await playingMessage.react("🔀");
            await playingMessage.react("⏹");

        } catch (error) {
            console.error(error);
        }

        if (!playingMessage) return client.embedReply(message, { embed: { description: "There was an internal error" } });
        const filter = (reaction: any, user: any): boolean => user.id !== client.user?.id;
        const collector = playingMessage.createReactionCollector({
            filter,
            time: song.duration !== -1 ? Number(song.duration) * 1000 : 600000
        });

        collector.on("collect", async (reaction, user) => {
            if (!queue) return;
            let member: GuildMember | undefined;
            try {
                member = await guild.members.fetch(user.id);

            } catch (err) {
                return client.embedReply(message, { embed: { description: "Member could not be found - Internal Error" } });
            }

            if (!member) return client.embedReply(message, { embed: { description: "Member could not be found - Internal Error" } });

            const { songs } = queue;

            switch (reaction.emoji.name) {
                case "⏭":
                    if (!client.canModifyQueue(member))
                        return queue.textChannel.send({ embeds: [{ description: `${user} You need to join a voice channel first!`, "color": client.primaryColour }] }).catch(console.error);
                    queue.playing = true;
                    reaction.users.remove(user).catch(console.error);

                    queue.audioResource?.audioPlayer?.stop();
                    queue.textChannel.send({ embeds: [{ description: `${user} ⏩ skipped the song`, "color": client.primaryColour }] }).catch(console.error);
                    collector.stop();
                    break;

                case "⏯":
                    if (!client.canModifyQueue(member))
                        return queue.textChannel.send({ embeds: [{ description: `${user} You need to join a voice channel first!`, "color": client.primaryColour }] }).catch(console.error);
                    reaction.users.remove(user).catch(console.error);

                    if (queue.playing) {
                        queue.playing = !queue.playing;
                        queue.audioResource?.audioPlayer?.pause(true);
                        queue.textChannel.send({ embeds: [{ description: `${user} ⏸ paused the music.`, "color": client.primaryColour }] }).catch(console.error);
                    } else {
                        queue.playing = !queue.playing;
                        queue.audioResource?.audioPlayer?.unpause();
                        queue.textChannel.send({ embeds: [{ description: `${user} ▶ resumed the music!`, "color": client.primaryColour }] }).catch(console.error);
                    }
                    break;

                case "🔇":
                    if (!client.canModifyQueue(member))
                        return queue.textChannel.send({ embeds: [{ description: `${user} You need to join a voice channel first!`, "color": client.primaryColour }] }).catch(console.error);
                    reaction.users.remove(user).catch(console.error);

                    queue.muted = !queue.muted;
                    if (queue.muted) {
                        queue.audioResource?.volume?.setVolumeLogarithmic(0);
                        queue.textChannel.send({ embeds: [{ description: `${user} 🔇 muted the music!`, "color": client.primaryColour }] }).catch(console.error);
                    } else {
                        queue.audioResource?.volume?.setVolumeLogarithmic(queue.volume / 100);
                        queue.textChannel.send({ embeds: [{ description: `${user} 🔊 unmuted the music!`, "color": client.primaryColour }] }).catch(console.error);
                    }
                    break;

                case "🔉":
                    if (!client.canModifyQueue(member))
                        return queue.textChannel.send({ embeds: [{ description: `${user} You need to join a voice channel first!`, "color": client.primaryColour }] }).catch(console.error);
                    reaction.users.remove(user).catch(console.error);
                    if (queue.volume === 0) return;

                    queue.volume = Math.max(queue.volume - 10, 0);
                    queue.audioResource?.volume?.setVolumeLogarithmic(queue.volume / 100);
                    queue.textChannel.send({
                        embeds: [{
                            description: `${user} 🔉 decreased the volume, the volume is now at ${queue.volume}%`, "color": client.primaryColour
                        }]
                    }).catch(console.error);

                    break;

                case "🔊":
                    if (!client.canModifyQueue(member))
                        return queue.textChannel.send({ embeds: [{ description: `${user} You need to join a voice channel first!`, "color": client.primaryColour }] }).catch(console.error);
                    reaction.users.remove(user).catch(console.error);
                    if (queue.volume === 100) return;

                    queue.volume = Math.min(queue.volume + 10, 100);
                    queue.audioResource?.volume?.setVolumeLogarithmic(queue.volume / 100);
                    queue.textChannel.send({
                        embeds: [{
                            description: `${user} 🔉 increased the volume, the volume is now at ${queue.volume}%`, "color": client.primaryColour
                        }]
                    }).catch(console.error);
                    break;

                case "🔁":
                    if (!client.canModifyQueue(member))
                        return queue.textChannel.send({ embeds: [{ description: `${user} You need to join a voice channel first!`, "color": client.primaryColour }] }).catch(console.error);
                    reaction.users.remove(user).catch(console.error);

                    queue.loop = !queue.loop;
                    queue.textChannel.send({ embeds: [{ description: `${user} 🔁 Looping is now ${queue.loop ? "**on**" : "**off**"}`, "color": client.primaryColour }] }).catch(console.error);

                    break;


                case "🔀":
                    if (!client.canModifyQueue(member))
                        return queue.textChannel.send({ embeds: [{ description: `${user} You need to join a voice channel first!`, "color": client.primaryColour }] }).catch(console.error);
                    reaction.users.remove(user).catch(console.error);


                    for (let i = songs.length - 1; i > 1; i--) {
                        const j = 1 + Math.floor(Math.random() * i);
                        [songs[i], songs[j]] = [songs[j], songs[i]];
                    }
                    queue.songs = songs;

                    queue.textChannel.send({ embeds: [{ description: `${user} 🔀 shuffled the queue`, "color": client.primaryColour }] }).catch(console.error);
                    break;

                case "⏹":
                    if (!client.canModifyQueue(member))
                        return queue.textChannel.send({ embeds: [{ description: `${user} You need to join a voice channel first!`, "color": client.primaryColour }] }).catch(console.error);
                    reaction.users.remove(user).catch(console.error);

                    queue.songs = [];
                    queue.textChannel.send({ embeds: [{ description: `${user} ⏹ stopped the music!`, "color": client.primaryColour }] }).catch(console.error);
                    try {
                        if (getVoiceConnection(guild.id))
                            queue.connection?.destroy();
                    } catch (error) {
                        console.error(error);
                        queue.connection?.disconnect();
                    }
                    client.queue.delete(guild.id);
                    collector.stop();
                    break;

                default:
                    reaction.users.remove(user).catch(console.error);
                    break;
            }
        });

        collector.on("end", () => {
            try {
                playingMessage?.reactions.removeAll().catch(console.error);
                if (PRUNING && playingMessage && playingMessage.deletable) {
                    setTimeout(async () => {
                        await playingMessage?.delete().catch(console.error);

                    }, 7000);
                }

            } catch (err) {
                console.error(err);
            }
        });
    }
}
