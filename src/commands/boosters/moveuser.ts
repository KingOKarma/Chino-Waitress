import { MessageEmbed, MessageReaction, User, VoiceChannel } from "discord.js";
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
    run: async (client, msg, args) => {

        const [memberID] = args;

        const member = await getMember(memberID, msg.guild);

        if (member === null) {
            return client.reply(msg, { content: "I Could not find that user" });
        }

        if (!msg.guild) return;

        if (member.id === msg.author.id) return client.reply(msg, { content: "Why would you move yourself into your own vc?" });

        const boosterVC = STORAGE.boosterVcs.find((v) => v === member.voice.channelId);

        if (boosterVC === undefined) {
            return client.reply(msg, { content: "Please make sure you are in one of the booster Voice Channels!" });
        }

        const vc = await getChannel(boosterVC, msg.guild);

        if (vc === null)
            return client.reply(msg, { content: "That's not a channel at all" });

        if (vc.type !== "GUILD_VOICE")
            return client.reply(msg, { content: "That channel is not a Voice Channel" });

        const otherVc = await getChannel(member.voice.channelId, msg.guild);

        if (otherVc === null) {
            return client.reply(msg, { content: `**${member.user.username}** is not in a VC to be dragged in from` });
        }

        const newMessage = await client.reply(msg, { content: `${member}, Would you like to be dragged into ${vc.name} by ${msg.author}?` });
        if (!newMessage) return client.reply(msg, { content: "Failed to react to current message..." });

        await newMessage.react("✅");
        await newMessage.react("❌");

        const filter = (reaction: MessageReaction, user: User): boolean => {
            return reaction.emoji.name === "✅" && user.id === member.id || reaction.emoji.name === "❌" && user.id === member.id;
        };


        const reactionCollector = newMessage.createReactionCollector({ filter, "time": 30000 });

        reactionCollector.on("collect", async (reaction, user) => {
            if (reaction.emoji.name === "✅") {

                const newcheck = msg.guild?.channels.cache.get(member.voice.channelId ?? "000");

                if (newcheck === undefined) {
                    reactionCollector.stop();
                    return client.reply(msg, { content: `${user} Please ensure you are in a vc to be dragged from` });
                }

                await member.voice.setChannel(vc as VoiceChannel, `They were dragged in on ${msg.author.tag}'s command`);

                const embed = new MessageEmbed()
                    .setAuthor({ "iconURL": msg.author.displayAvatarURL({ dynamic: true }), "name": msg.author.tag })
                    .setTitle("Booster Move!")
                    .setDescription(`I just moved ${member} into ${vc.name} by ${msg.author}`)
                    .setTimestamp();
                reactionCollector.stop();

                return client.reply(msg, { embeds: [embed] });

            } else if (reaction.emoji.name === "❌") {
                reactionCollector.stop();
                return client.reply(msg, { content: `${msg.author}, They have declined your offer` });

            }
            reactionCollector.on("end", async () => {
                return client.reply(msg, { content: "The offer timed out, please try again when you want" });

            });
        });
        return null;

    }
};
