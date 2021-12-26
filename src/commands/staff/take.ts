import { Command } from "../../interfaces";
import { MessageEmbed } from "discord.js";
import { User } from "../../entity/user";
import { getMember } from "../../utils/getMember";
import { getRepository } from "typeorm";
import { rolePerms } from "../../globals";

export const command: Command = {
    cooldown: 3,
    description: "Takes currency from a user",
    example: ["!take @user 200"],
    group: "staff",
    guildOnly: true,
    name: "take",
    permissionsBot: rolePerms,
    staffOnly: true,
    // eslint-disable-next-line sort-keys
    run: async (client, msg, args) => {
        const [memberID, amount] = args;
        if (!msg.guild) return;

        const userRepo = getRepository(User);
        let member = await getMember(memberID, msg.guild);

        if (!member) {
            ({ member } = msg);
        }

        if (!member) return;

        let user = await userRepo.findOne({ serverId: msg.guild.id, uid: member.user.id });

        if (!user) {
            const newUser = new User();
            newUser.uid = member.user.id;
            newUser.serverId = member.guild.id;
            newUser.avatar = member.user.displayAvatarURL({ dynamic: true });
            newUser.tag = member.user.tag;
            newUser.balance = 1;
            user = newUser;
        }

        let userBal = user.balance;
        userBal -= Number(amount);

        user.balance -= Number(amount);
        await userRepo.save(user);
        const embed = new MessageEmbed()
            .setAuthor({ "iconURL": msg.author.displayAvatarURL({ dynamic: true }), "name": msg.author.tag })
            .setTitle("User Take")
            .setDescription(`I have taken **${amount}🍩** from \`${member.user.tag}\` they now have **${userBal}**🍩 Donuts`)
            .setFooter(`Taken by ${msg.author.tag}`)
            .setTimestamp();
        return client.reply(msg, { embeds: [embed] });
    }
};
