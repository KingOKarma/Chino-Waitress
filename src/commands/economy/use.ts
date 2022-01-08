import { CONFIG, rolePerms } from "../../globals";
import { Command } from "../../interfaces";
import { Inventory } from "../../entity/inventory";
import { User } from "../../entity/user";
import { getRepository } from "typeorm";

export const command: Command = {
    aliases: ["activate", "interact"],
    cooldown: 3,
    description: "Use's an item in your inventory",
    example: ["!use slinky"],
    group: "economy",
    guildOnly: true,
    name: "use",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {
        const [itemName] = args;
        if (!msg.guild) return;

        const userRepo = getRepository(User);
        const invRepo = getRepository(Inventory);

        let user = await userRepo.findOne({ serverId: msg.guild.id, uid: msg.author.id });
        const inv = await invRepo.findOne({ serverid: msg.guild.id, uid: msg.author.id });

        if (!user) {
            const newUser = new User();
            newUser.uid = msg.author.id;
            newUser.serverId = msg.guild.id;
            newUser.avatar = msg.author.displayAvatarURL({ dynamic: true });
            newUser.tag = msg.author.tag;
            newUser.balance = 1;
            await userRepo.save(newUser);
            user = newUser;
        }

        if (!inv) {
            return client.embedReply(msg, { embed: { description: "You don't seem to have an inventory, make sure to buy something from the shop first!" } });
        }

        const index = inv.items.indexOf(itemName, 0);
        if (index > -1) {
            inv.items.splice(index, 1);
        }
        await invRepo.save(inv);

        const guildicon = msg.guild.iconURL({ dynamic: true });

        return client.embedReply(msg, {
            embed: {
                author: { iconURL: msg.author.displayAvatarURL({ dynamic: true }), name: msg.author.tag },
                title: "Currency",
                thumbnail: { url: guildicon ?? "" },
                description: `The item **${itemName}** was ysed by **${msg.author.tag}** (${msg.author.id}) in **${msg.guild.name}** (${msg.guild.id})`,
                footer: { "text": `You can use \`${CONFIG.prefix}inv\` to check what other items you have` },
                timestamp: msg.createdTimestamp
            }
        });
    }
};
