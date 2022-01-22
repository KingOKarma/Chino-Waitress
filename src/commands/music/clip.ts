import { DiscordGatewayAdapterCreator, createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
import { existsSync, readdirSync } from "fs";
import { Command } from "../../interfaces";
import { Queue } from "../../interfaces/music/queue";
import path from "path";
import { rolePerms } from "../../globals";

export const command: Command = {
    cooldown: 3,
    description: "Plays a clip sound",
    djMode: true,
    example: ["!clip <name>"],
    group: "music",
    guildOnly: true,
    name: "clip",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg, args }) => {

        if (!msg.member) return;
        const { guild } = msg;
        if (!guild) return;

        const { channel } = msg.member.voice;
        const queue = client.queue.get(guild.id);

        if (!args.length) return client.embedReply(msg, { embed: { description: `Usage: ${command.example[0]}` } }).catch(console.error);
        if (queue) return client.embedReply(msg, { embed: { description: "Can't play clip because there is an active queue." } });
        if (!channel) return client.embedReply(msg, { embed: { description: "You need to join a voice channel first!" } }).catch(console.error);

        let [sound] = args;
        if (sound.includes(".mp3")) sound = sound.replace(".mp3", "");

        const soundsPath = path.join(__dirname, "..", "..", "..", "sounds");
        const soundsList: string[] = [];
        readdirSync(soundsPath).forEach(async (file) => {
            if (file.includes(".mp3")) file = file.replace(".mp3", "");
            soundsList.push(file);
        });

        if (!existsSync(`./sounds/${sound}.mp3`)) return client.embedReply(msg, {
            embed: {
                description: `That Sound does not exist, The list of sounds are: \n${soundsList.join("\n")}`
            }
        }).catch(console.error);

        if (msg.channel.type !== "GUILD_TEXT") return client.embedReply(msg, { embed: { description: "Please run this command in a Text channel, not a News or Thread!" } });

        if (channel.type !== "GUILD_VOICE") return client.embedReply(msg, {
            embed: {
                description:
                    "The vc Must not be a Stage channel, As of right now I am not able to play music in Stage Channels"
            }
        });

        const audioResource = null;
        const queueConstruct: Queue = {
            textChannel: msg.channel,
            channel,
            connection: null,
            songs: [],
            loop: false,
            volume: 100,
            muted: false,
            playing: true,
            audioResource
        };

        client.queue.set(guild.id, queueConstruct);

        try {
            queueConstruct.connection = joinVoiceChannel({
                "channelId": channel.id,
                "guildId": guild.id,
                "adapterCreator": guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
            });

            try {

                const player = createAudioPlayer();

                const resource = createAudioResource(`./sounds/${sound}.mp3`);
                queueConstruct.audioResource = resource;

                player.play(resource);

                queueConstruct.connection.subscribe(player);

                player.on("stateChange", (oldState, newState) => {
                    let leaveVC = false;
                    if (oldState.status === "playing" && newState.status === "idle") leaveVC = true;
                    if (newState.status === "autopaused") leaveVC = true;
                    if (leaveVC) {
                        client.queue.delete(guild.id);
                        try {
                            queueConstruct.connection?.destroy();

                        } catch (err) {
                            console.error(err);
                        }
                    }
                });


            } catch (err) {
                client.queue.delete(guild.id);
                queueConstruct.connection.destroy();
                console.error(err);
            }

            return await client.embedReply(msg, { embed: { description: `🎶 Started playing: **${sound}**` } });
        } catch (error) {
            client.queue.delete(guild.id);
            console.error(error);
        }
    }
};
