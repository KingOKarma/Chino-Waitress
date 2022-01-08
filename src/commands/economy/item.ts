import { CONFIG, rolePerms } from "../../globals";
import { Command } from "../../interfaces";
import { Guild } from "../../entity/guild";
import { ItemMeta } from "../../entity/item";
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
            return client.embedReply(msg, { embed: { description: `The shop is currently empty please ask someone with "Manage Server" permissions to run \`${CONFIG.prefix}additem\`` } });
        }

        if (!item) {
            return client.embedReply(msg, { embed: { description: "This item does not exist, make sure you are typing the EXACT name" } });
        }

        const guildicon = msg.guild.iconURL({ dynamic: true });

        return client.embedReply(msg, {
            embed: {
                author: { iconURL: msg.author.displayAvatarURL({ dynamic: true }), name: msg.author.tag },
                title: `${msg.guild.name}'s Item Info`,
                fields: [
                    { name: "Name", value: item.name, inline: true },

                    { name: "Description", value: item.description, inline: true },

                    { name: "Price", value: `${item.price}🍩 Donuts`, inline: true },

                    { name: "Stock Left", value: item.max.toString(), inline: true },

                    { name: "ID", value: item.id.toString(), inline: true }
                ],
                footer: { text: "If there is a problem with an item please report it's ID number to the dev" },
                thumbnail: { url: guildicon ?? "" }
            }
        });
    }
};
