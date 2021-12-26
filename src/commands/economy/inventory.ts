import { Command } from "../../interfaces";
import { Guild } from "../../entity/guild";
import { Inventory } from "../../entity/inventory";
import { ItemMeta } from "../../entity/item";
import { MessageEmbed } from "discord.js";
import { arrayPage } from "../../utils/arrayPage";
import { getRepository } from "typeorm";
import { rolePerms } from "../../globals";


export const command: Command = {
    aliases: ["inv", "iv"],
    boosterOnly: true,
    cooldown: 3,
    description: "Display's your user's inventory",
    example: ["!inventory 3"],
    group: "economy",
    guildOnly: true,
    name: "inventory",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {
        const [page] = args;
        if (!msg.guild) return;

        const invRepo = getRepository(Inventory);
        const itemsRepo = getRepository(ItemMeta);
        const guildRepo = getRepository(Guild);

        const guild = await guildRepo.findOne({ serverid: msg.guild.id });

        const itemList = await invRepo.findOne({ serverid: msg.guild.id, uid: msg.author.id });

        if (!itemList) {
            return client.reply(msg, { content: "You have no items in your inventory, you can buy them from the server shop!" });
        }

        if (!guild) {
            return client.reply(msg, { content: "A shop has not been setup in this server, please ask a server manager to do so" });
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const iteamsPaged = arrayPage(itemList.items, 9, Number(page ?? 1));

        if (iteamsPaged.length === 0) {
            return client.reply(msg, { content: "There are no items on that page" });
        }

        const guildicon = msg.guild.iconURL({ dynamic: true });

        const embed = new MessageEmbed();

        // eslint-disable-next-line no-restricted-syntax
        for (const item of iteamsPaged) {
            // eslint-disable-next-line no-await-in-loop
            const itemInfo = await itemsRepo.findOne({ guild, name: item });
            if (!itemInfo) {
                return client.reply(msg, { content: "An item in the server could not be found" });
            }
            embed.addField(`${item}`, itemInfo.description);
        }

        embed.setColor("BLUE");
        embed.setAuthor({ "iconURL": msg.author.displayAvatarURL({ dynamic: true }), "name": msg.author.tag });
        embed.setTitle("Inventory");
        embed.setFooter("If there is a problem with an item please report it's ID number to the dev");
        embed.setThumbnail(guildicon ?? "");

        return client.reply(msg, { embeds: [embed] });
    }
};
