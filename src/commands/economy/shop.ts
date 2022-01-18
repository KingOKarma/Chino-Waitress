import { CONFIG, rolePerms } from "../../globals";
import { Command } from "../../interfaces";
import { EmbedFieldData } from "discord.js";
import { Guild } from "../../entity/guild";
import { ItemMeta } from "../../entity/item";
import { arrayPage } from "../../utils/arrayPage";
import { getRepository } from "typeorm";

export const command: Command = {
    aliases: ["market"],
    cooldown: 3,
    description: "Displays the server shop",
    example: ["!page 2", "!page"],
    group: "economy",
    guildOnly: true,
    name: "shop",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg, args }) => {
        const [page] = args;
        if (!msg.guild) return;

        const guildRepo = getRepository(Guild);

        const guild = await guildRepo.findOne({ relations: ["shop"], where: { serverid: msg.guild.id } });
        if (!guild) {
            return client.embedReply(msg, { embed: { description: `The shop is currently empty please ask someone with "Manage Server" permissions to run \`${CONFIG.prefix}additem\`` } });
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const iteamsPaged: ItemMeta[] = arrayPage(guild.shop, 9, Number(page ?? 1));

        if (iteamsPaged.length === 0) {
            return client.embedReply(msg, { embed: { description: "There are no items on that page Or the shop doens't Currntly exist on the server yet!" } });
        }

        let guildicon = msg.guild.iconURL({ dynamic: true });
        if (guildicon === null) {
            guildicon = "";
        }

        const fields: EmbedFieldData[] = [];

        iteamsPaged.forEach((item) => {
            let text = `In Stock: ${item.max}`;
            if (item.max === 0) {
                text = "|| OUT OF STOCK ||";
            }

            fields.push({ name: item.name, value: `${item.description}\n\`\`\`Price: ${item.price} Donut(s)\n${text}\nID: ${item.id}\`\`\`` });
        });

        return client.embedReply(msg, {
            embed: {
                author: { iconURL: msg.author.displayAvatarURL({ dynamic: true }), name: msg.author.tag },
                title: `${msg.guild.name}'s Server Shop`,
                footer: { text: "If there is a problem with an item please report it's ID number to the dev" },
                thumbnail: { url: guildicon },
                fields
            }
        });
    }
};
