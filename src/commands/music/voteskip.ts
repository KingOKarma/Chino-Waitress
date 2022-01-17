import { CONFIG, rolePerms } from "../../globals";
import { GuildMember, Message, MessageReaction, User } from "discord.js";
import { Command } from "../../interfaces";

export const command: Command = {
    aliases: ["vs"],
    cooldown: 3,
    description: "Votes to skip a song.",
    example: [`${CONFIG.prefix}voteskip`],
    group: "music",
    guildOnly: true,
    name: "voteskip",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {

        const queue = client.queue.get(msg.guild?.id ?? "");
        if (!queue) return client.embedReply(msg, { embed: { description: "There is nothing playing that I could skip for you." } }).catch(console.error);

        const [song] = queue.songs;
        if (!client.canModifyQueue(msg.member)) return client.embedReply(msg, { embed: { description: `${msg.author} You need to join a voice channel first!` } }).catch(console.error);
        const message = await client.embedReply(msg, { embed: { description: `${msg.author} has requested to voteskip **[${song.title}](${song.url})**!` } });
        if (!(message instanceof Message)) return client.embedReply(msg, { embed: { description: "There was an internal error" } });

        await message.react("⏩");
        const filter = (reaction: MessageReaction, user: User): boolean => user.id !== client.user?.id;
        const collector = message.createReactionCollector({
            filter,
            time: 30 * 1000
        }
        );
        let totalSkips = 0;
        collector.on("collect", async (reaction, user) => {
            let member: GuildMember | undefined;

            try {
                member = await msg.guild?.members.fetch(user.id);
            } catch (err) {
                return client.embedReply(message, { embed: { description: "Internal error - Member oculd not be found." } });
            }

            if (!member) return client.embedReply(message, { embed: { description: "Member could not be found - Internal Error" } });

            switch (reaction.emoji.name) {
                case "⏩": {
                    if (!client.canModifyQueue(member)) {
                        return reaction.remove();
                    }
                    const memberSize = queue.channel.members.size;
                    totalSkips++;

                    if (totalSkips >= Math.round((memberSize + 1) / 2))
                        queue.playing = true;
                    queue.audioResource?.audioPlayer?.stop();
                    client.embedReply(msg, { embed: { description: "⏩ Voteskip Successful! Skipping the current song..." } }).catch(console.error);

                }
                default: {
                    return reaction.remove();
                }
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        collector.on("end", (collected, reason) => {
            const memberSize = queue.channel.members.size;
            if (!(totalSkips >= Math.round((memberSize + 1) / 2))) {
                return client.embedReply(msg, { embed: { description: "🚫 Vote Skip has failed." } } );
            }

        });

    }
};
