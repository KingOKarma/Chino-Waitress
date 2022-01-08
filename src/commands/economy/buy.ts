import { CONFIG, rolePerms } from "../../globals";
import { Command } from "../../interfaces";
import { Guild } from "../../entity/guild";
import { Inventory } from "../../entity/inventory";
import { ItemMeta } from "../../entity/item";
import { User } from "../../entity/user";
import { getRepository } from "typeorm";

export const command: Command = {
    boosterOnly: true,
    cooldown: 3,
    description: "Buy anything from a server shop",
    example: ["!buy silly-string"],
    group: "economy",
    guildOnly: true,
    name: "buy",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {
        const [itemName] = args;
        if (!msg.guild) return;


        const userRepo = getRepository(User);
        const itemsRepo = getRepository(ItemMeta);
        const invRepo = getRepository(Inventory);
        const guildRepo = getRepository(Guild);

        const guild = await guildRepo.findOne({ serverid: msg.guild.id });
        let user = await userRepo.findOne({ serverId: msg.guild.id, uid: msg.author.id });
        const item = await itemsRepo.findOne({ guild, name: itemName });
        const inv = await invRepo.findOne({ serverid: msg.guild.id, uid: msg.author.id });

        if (!item) {
            return client.embedReply(msg, { embed: { description: "That item does not exist in the shop, try again with the exact name!" } });
        }

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

        if (user.balance < item.price) {
            return client.embedReply(msg, { embed: { description: `You don't have enough Donuts for **${item.name}**!` } });
        }

        if (item.max === 0) {
            return client.embedReply(msg, {
                embed: {
                    description:
                        `Sorry there are no more **${itemName}'s** left in stock!`
                        + `\nPlease ask a server manager to add to the stock with \`${CONFIG.prefix}addstock\`!`
                        + "```diff\n- OUT OF STOCK```"
                }
            });
        }

        if (!inv) {
            const newInv = new Inventory();
            newInv.serverid = msg.guild.id;
            newInv.uid = msg.author.id;
            newInv.user = user;
            newInv.items = [item.name];
            await invRepo.save(newInv);
        } else {
            inv.items.push(item.name);
            await invRepo.save(inv);
        }

        user.balance -= item.price;
        item.max -= 1;
        await userRepo.save(user);
        await itemsRepo.save(item);

        let guildicon = msg.guild.iconURL({ dynamic: true });
        if (guildicon === null) {
            guildicon = "";
        }

        return client.embedReply(msg, { embed: {
            author: { iconURL: msg.author.displayAvatarURL({ dynamic: true }), name: msg.author.tag },
            thumbnail: { url: guildicon },
            title: "Currency",
            description: `You just bought **${itemName}**, You can find it with \`${CONFIG.prefix}inv\`!`,
            footer: { text: `You can use ${CONFIG.prefix}inv to check what items you have` },
            timestamp: msg.createdTimestamp
        } });
    }
};
