/* eslint-disable camelcase */
import {
} from "../../bot/utils/roles";
import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { User } from "../../entity/user";
import { getMember } from "../../bot/utils/utils";
import { getRepository } from "typeorm";
import { rolePerms } from "../../bot/globals";

export default class StaffTakeCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            args: [
                {
                    key: "memberID",
                    prompt: "The User you are taking from",
                    type: "string"
                },
                {
                    error: "Please only use a number for the price",
                    key: "amount",
                    prompt: "How much are you taking from the user?",
                    type: "integer",
                    validate: (amount: number): boolean => amount >= 0
                }
            ],

            clientPermissions: rolePerms,
            description: "takes money from a user",
            group: "staff",
            guildOnly: true,
            memberName: "take",
            name: "take",
            throttling: {
                duration: 5,
                usages: 3
            },
            userPermissions: rolePerms
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { memberID, amount }: {
            amount: number;
            memberID: string;
        }
    ): Promise<Message | Message[]> {
        const userRepo = getRepository(User);
        let member = await getMember(memberID, msg.guild);

        if (member === null) {
            ({ member } = msg);
        }

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
        userBal -= amount;

        user.balance -= amount;
        await userRepo.save(user);
        const embed = new MessageEmbed()
            .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
            .setTitle("User Take")
            .setDescription(`I have taken **${amount}🍩** from \`${member.user.tag}\` they now have **${userBal}**🍩 Donuts`)
            .setFooter(`Taken by ${msg.author.tag}`)
            .setTimestamp();
        return msg.say(embed);
    }
}
