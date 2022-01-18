import { Command } from "../../interfaces";
import { User } from "../../entity/user";
import { getMember } from "../../utils/getMember";
import { getRepository } from "typeorm";
import { rolePerms } from "../../globals";

export const command: Command = {
    cooldown: 3,
    description: "Gives currency to a user",
    example: ["!give @user 200"],
    group: "staff",
    guildOnly: true,
    name: "give",
    permissionsBot: rolePerms,
    staffOnly: true,
    // eslint-disable-next-line sort-keys
    run: async ({ client, msg, args }) => {
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
        userBal += Number(amount);

        user.balance += Number(amount);
        await userRepo.save(user);

        return client.embedReply(msg, {
            embed: {
                author: { iconURL: member.user.displayAvatarURL({ dynamic: true }), name: member.user.tag },
                title: "User Give",
                description: `I have given **${amount}🍩** to \`${member.user.tag}\` they now have **${userBal}**🍩 Donuts`,
                footer: { text: `Given by ${msg.author.tag}` },
                timestamp: msg.createdTimestamp
            }
        });
    }
};
