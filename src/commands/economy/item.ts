import { CONFIG, rolePerms } from "../../globals";
import { Command } from "../../interfaces";
import { Guild } from "../../entity/guild";
import { ItemMeta } from "../../entity/item";
import { MessageEmbed } from "discord.js";
import { getRepository } from "typeorm";

export const command: Command = {
    aliases: ["iteminfo"],
    boosterOnly: true,
    cooldown: 3,
    description: "Displays an item from the server shop",
    example: ["!item slinky"],
    group: "economy",
    guildOnly: true,
    name: "item",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {
        const [itemName] = args;
        if (!msg.guild) return;

        const guildRepo = getRepository(Guild);
        const itemsRepo = getRepository(ItemMeta);

        const guild = await guildRepo.findOne({ serverid: msg.guild.id });
        const item = await itemsRepo.findOne({ guild, name: itemName });

        if (!guild) {
            return client.reply(msg, { content: `The shop is currently empty please ask someone with "Manage Server" permissions to run \`${CONFIG.prefix}additem\`` });
        }

        if (!item) {
            return client.reply(msg, { content: "This item does not exist, make sure you are typing the EXACT name" });
        }

        const guildicon = msg.guild.iconURL({ dynamic: true });

        const embed = new MessageEmbed();
        embed.setColor("BLUE");
        embed.setAuthor({ "iconURL": msg.author.displayAvatarURL({ dynamic: true }), "name": msg.author.tag });
        embed.setTitle(`${msg.guild.name}'s Item Info`);
        embed.addField("Name", `${item.name}`, true);
        embed.addField("Description", `${item.description}`, true);
        embed.addField("Price", `${item.price}🍩 Donut(s)`, true);
        embed.addField("Stock left", `${item.max}`, true);
        embed.addField("ID", `${item.id}`, true);

        embed.setFooter("If there is a problem with an item please report it's ID number to the dev");
        embed.setThumbnail(guildicon ?? "");

        return client.reply(msg, { embeds: [embed] });
    }
};
