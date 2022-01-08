import { Command } from "../../interfaces";
import { EmbedFieldData } from "discord.js";
import { Guild } from "../../entity/guild";
import { Inventory } from "../../entity/inventory";
import { ItemMeta } from "../../entity/item";
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
            return client.embedReply(msg, { embed: { description: "You have no items in your inventory, you can buy them from the server shop!" } });
        }

        if (!guild) {
            return client.embedReply(msg, { embed: { description: "A shop has not been setup in this server, please ask a server manager to do so" } });
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const iteamsPaged = arrayPage(itemList.items, 9, Number(page ?? 1));

        if (iteamsPaged.length === 0) {
            return client.embedReply(msg, { embed: { description: "There are no items on that page" } });
        }

        const guildicon = msg.guild.iconURL({ dynamic: true });

        const fields: EmbedFieldData[] = [];
        const promise = new Promise<void>((resolve, reject) => {
            iteamsPaged.forEach(async (i) => {

                const itemInfo = await itemsRepo.findOne({ guild, name: i });
                if (!itemInfo) {
                    return void reject(i);
                }

                fields.push({ name: i, value: itemInfo.description });

            });
        });

        try {
            await promise;
        } catch (err) {
            return client.embedReply(msg, { embed: { description: `The item **${err}** could not be found` } });
        }


        return client.embedReply(msg, {
            embed: {
                author: { iconURL: msg.author.displayAvatarURL({ dynamic: true }), name: msg.author.tag },
                title: "Inventory",
                footer: { text: "If there is a problem with an item please report it's ID number to the dev" },
                thumbnail: { url: guildicon ?? "" },
                fields
            }
        });
    }
};
