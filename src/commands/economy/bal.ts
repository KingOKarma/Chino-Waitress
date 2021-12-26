import { Command } from "../../interfaces";
import { MessageEmbed } from "discord.js";
import { User } from "../../entity/user";
import { getMember } from "../../utils/getMember";
import { getRepository } from "typeorm";
import { rolePerms } from "../../globals";

export const command: Command = {
    aliases: ["bal", "money", "currency"],
    boosterOnly: true,
    cooldown: 3,
    description: "Check the balance of a user",
    example: ["!balance"],
    group: "economy",
    guildOnly: true,
    name: "balance",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {
        const [memberID] = args;
        if (!msg.guild) return;

        const userRepo = getRepository(User);

        let member = await getMember(memberID, msg.guild);

        if (!member) {
            ({ member } = msg);
        }

        const user = await userRepo.findOne({ serverId: msg.guild.id, uid: member?.id });

        if (user) {
            const embed = new MessageEmbed()
                .setColor("BLUE")
                .setTitle("Currency")
                .setAuthor({ "iconURL": msg.author.displayAvatarURL({ dynamic: true }), "name": msg.author.tag })
                .setDescription(`User has **${user.balance}🍩** Donuts banked`)
                .setTimestamp();
            return client.reply(msg, { embeds: [embed] });
        }

        return client.reply(msg, { content: "Whoops error ```user not found``` \nThey may not have any money stored" });
    }
};
