/* eslint-disable @typescript-eslint/no-explicit-any */
import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../interfaces";
import ExtendedClient from "../../client/client";
import { Songs } from "../../interfaces/music/queue";
import { rolePerms } from "../../globals";


function generateQueueEmbed(message: Message, queue: Songs[], client: ExtendedClient): MessageEmbed[] {
    const embeds: MessageEmbed[] = [];
    let k = 10;

    for (let i = 0; i < queue.length; i += 10) {
        const current = queue.slice(i, k);
        let j = i;
        k += 10;

        const info = current.map((track) => `${++j} - [${track.title}](${track.url})`).join("\n");

        const embed = new MessageEmbed()
            .setTitle("Song Queue\n")
            .setThumbnail(message.guild?.iconURL({ dynamic: true }) ?? "")
            .setColor(client.primaryColour)
            .setDescription(
                `**Current Song - [${queue[0].title}](${queue[0].url})**\n\n${info}`
            )
            .setTimestamp();
        embeds.push(embed);
    }

    return embeds;
}


export const command: Command = {
    aliases: ["q"],
    cooldown: 5,
    description: "Show the music queue and now playing.",
    example: ["!queue"],
    group: "music",
    guildOnly: true,
    name: "queue",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {

        if (!msg.guild) return client.embedReply(msg, { embed: { description: "There was an internal error" } }).catch(console.error);
        if (!msg.guild.me) return client.embedReply(msg, { embed: { description: "There was an internal error" } }).catch(console.error);

        if (msg.channel.type !== "GUILD_TEXT") return client.embedReply(msg, { embed: { description: "Please type this command in a normal **text** channel" } }).catch(console.error);
        const permissions = msg.channel.permissionsFor(msg.guild.me);
        if (!permissions.has(["MANAGE_MESSAGES", "ADD_REACTIONS"]))
            return client.embedReply(msg, { embed: { description: "Missing permission to manage messages or add reactions" } }).catch(console.error);

        const queue = client.queue.get(msg.guild.id);
        if (!queue || !queue.songs.length) return client.embedReply(msg, { embed: { description: "There is no queue." } });

        let currentPage = 0;
        const embeds = generateQueueEmbed(msg, queue.songs, client);

        const queueEmbed = await msg.channel.send({ embeds: [embeds[currentPage]], content: `**Current Page - ${currentPage + 1}/${embeds.length}**` }).catch(console.error);

        if (!(queueEmbed instanceof Message)) return client.embedReply(msg, { embed: { description: "There was an internal error" } }).catch(console.error);

        try {
            await queueEmbed.react("⬅️");
            await queueEmbed.react("⏹");
            await queueEmbed.react("➡️");
        } catch (error: any) {
            console.error(error);
            return client.embedReply(msg, { embed: { description: `There was an internal error\n${error.message}` } }).catch(console.error);
        }

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        const filter = (reaction: any, user: any) => {
            return ["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) && msg.author.id === user.id;

        };
        const collector = queueEmbed.createReactionCollector({ filter, time: 60000 });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        collector.on("collect", async (reaction, _user) => {
            try {
                if (reaction.emoji.name === "➡️") {
                    if (currentPage < embeds.length - 1) {
                        currentPage++;
                        await queueEmbed.edit({ embeds: [embeds[currentPage]], content: `**Current Page - ${currentPage + 1}/${embeds.length}**` }).catch(console.error);
                    }
                } else if (reaction.emoji.name === "⬅️") {
                    if (currentPage !== 0) {
                        --currentPage;
                        await queueEmbed.edit({ embeds: [embeds[currentPage]], content:`**Current Page - ${currentPage + 1}/${embeds.length}**` }).catch(console.error);
                    }
                } else {
                    collector.stop();
                    await reaction.message.reactions.removeAll();
                }
                await reaction.users.remove(msg.author.id);
            } catch (error: any) {
                console.error(error);
                return msg.channel.send(error.message).catch(console.error);
            }
        });
    }
};

