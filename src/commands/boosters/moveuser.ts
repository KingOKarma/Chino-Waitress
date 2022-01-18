import { MessageReaction, User, VoiceChannel } from "discord.js";
import { STORAGE, rolePerms } from "../../globals";
import { Command } from "../../interfaces";
import { getChannel } from "../../utils/getChannel";
import { getMember } from "../../utils/getMember";


export const command: Command = {
    // Note aliases are optional
    aliases: ["vc", "move"],
    boosterOnly: true,
    cooldown: 3,
    cooldownResponse: "Hey there slow down, I can understand you want to move users but wait another {time}",
    description: "Allows boosters to ask normal users if they would like to be moved into the Boosters VC!",
    example: ["!moveuser @kurry"],
    group: "boosters",
    guildOnly: true,
    name: "moveuser",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg, args }) => {

        const [memberID] = args;

        const member = await getMember(memberID, msg.guild);

        if (member === null) {
            return client.embedReply(msg, { embed: { description: "I Could not find that user" } });
        }

        if (!msg.guild) return;

        if (member.id === msg.author.id) return client.embedReply(msg, { embed: { description: "Why would you move yourself into your own vc?" } });

        const boosterVC = STORAGE.boosterVcs.find((v) => v === member.voice.channelId);

        if (boosterVC === undefined) {
            return client.embedReply(msg, { embed: { description: "Please make sure you are in one of the booster Voice Channels!" } });
        }

        const vc = await getChannel(boosterVC, msg.guild);

        if (vc === null)
            return client.embedReply(msg, { embed: { description: "That's not a channel at all" } });

        if (vc.type !== "GUILD_VOICE")
            return client.embedReply(msg, { embed: { description: "That channel is not a Voice Channel" } });

        const otherVc = await getChannel(member.voice.channelId, msg.guild);

        if (otherVc === null) {
            return client.embedReply(msg, { embed: { description: `**${member.user.username}** is not in a VC to be dragged in from` } });
        }

        const newMessage = await client.embedReply(msg, { embed: { description: `${member}, Would you like to be dragged into ${vc.name} by ${msg.author}?` } });
        if (!newMessage) return client.embedReply(msg, { embed: { description: "Failed to react to current message..." } });

        await newMessage.react("✅");
        await newMessage.react("❌");

        const filter = (reaction: MessageReaction, user: User): boolean => {
            return reaction.emoji.name === "✅" && user.id === member.id || reaction.emoji.name === "❌" && user.id === member.id;
        };


        try {
            const reactions = await newMessage.awaitReactions({ filter, "time": 30000, errors: ["time"], max: 1, dispose: true });

            if (reactions.get("✅")) {

                const newcheck = msg.guild.channels.cache.get(member.voice.channelId ?? "000");

                if (newcheck === undefined) {
                    return await client.embedReply(newMessage, { embed: { description: `${member} Please ensure you are in a vc to be dragged from` } });
                }

                await member.voice.setChannel(vc as VoiceChannel, `They were dragged in on ${msg.author.tag}'s command`);

                return await client.embedReply(newMessage, {
                    embed: {
                        author: { iconURL: msg.author.displayAvatarURL({ dynamic: true }), name: msg.author.tag },
                        title: "Booster Move",
                        description: `I just moved ${member} into ${vc.name} by ${msg.author}`,
                        timestamp: Date.now()
                    }
                });

            } else if (reactions.get("❌")) {
                return await client.embedReply(newMessage, { embed: { description: `${msg.author}, They have declined your offer` } });

            }


        } catch (err) {
            return client.embedReply(msg, { embed: { description: "The offer timed out, please try again when you want" } });
        }

    }
};
