import { CONFIG, rolePerms } from "../../globals";
import { Command } from "../../interfaces";
import { MessageEmbed } from "discord.js";
import { User } from "../../entity/user";
import { arrayPage } from "../../utils/arrayPage";
import { getRepository } from "typeorm";

export const command: Command = {
    aliases: ["lb"],
    boosterOnly: true,
    cooldown: 3,
    description: "Lists the Donuts leaderboard for the server!",
    example: ["!leaderboard 3", "!leaderboard"],
    group: "economy",
    guildOnly: true,
    name: "leaderboard",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {
        const [page] = args;
        if (!msg.guild) return;

        const userRepo = getRepository(User);

        const users = await userRepo.find({
            order: { serverId: "DESC", uid: "DESC" },
            where: [{ serverId: msg.guild.id }]
        });
        users.sort((a, b) => b.balance - a.balance);

        users.forEach((usersArray, index) => {
            // eslint-disable-next-line no-param-reassign
            usersArray.tag = `${index + 1} || ${usersArray.tag}`;
        });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const iteamsPaged = arrayPage(users, 9, Number(page ?? 1));

        const authorPost = users.find((user) => user.uid === msg.author.id);

        if (authorPost === undefined) return client.reply(msg, { content: "There was a problem getting your user from the database, try again!" });

        if (iteamsPaged.length === 0) return client.reply(msg, { content: "There are no members on that page" });

        const embed = new MessageEmbed()
            .setAuthor({ "iconURL": msg.author.displayAvatarURL({ dynamic: true }), "name": msg.author.tag })
            .setTitle(`${msg.guild.name}'s Leaderboard`)
            .setDescription(`You are: **${authorPost.tag}**\n with \`${authorPost.balance}\`🍩 Donuts`)
            .setFooter(`You can find the next page with ${CONFIG.prefix}lb <page_number>`);
        iteamsPaged.forEach((user) => embed.addField(user.tag, `**${user.balance}**🍩 Donuts`, true));

        return client.reply(msg, { embeds: [embed] });
    }
};
