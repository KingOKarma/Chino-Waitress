import ExtendedClient from "../../client/client";
import { Guild } from "../../entity/guild";
import { Message } from "discord.js";
import { STORAGE } from "../../globals";
import { User } from "../../entity/user";
import { checkRoles } from "../../utils/checkRoles";
import { getRepository } from "typeorm";

const xpTimeout: Map<string, string> = new Map();

export async function messageXP(client: ExtendedClient, msg: Message): Promise<void | Message> {
    if (msg.author.bot) return undefined;
    if (msg.guild === null) return undefined;
    if (msg.member === null) return undefined;

    const perms = checkRoles(msg.member, STORAGE.allowedRoles);
    if (!perms) {
        return undefined;
    }

    const userRepo = getRepository(User);
    const guildRepo = getRepository(Guild);

    let guild = await guildRepo.findOne({ serverid: msg.guild.id });
    const user = await userRepo.findOne({ serverId: msg.guild.id, uid: msg.author.id });
    const timeout = xpTimeout.get(`${msg.author.id}messageEarn`);
    const balGain = Math.floor(Math.random() * 7 + 2);

    // If there is no Guild then add to  DB
    if (!guild) {
    // eslint-disable-next-line new-cap
        const newGuild = new Guild();
        newGuild.serverid = msg.guild.id;
        newGuild.name = msg.guild.name;
        await guildRepo.save(newGuild);
        guild = newGuild;
    }

    if (timeout === undefined) {
        if (!user) {
            const newUser = new User();
            newUser.uid = msg.author.id;
            newUser.serverId = msg.guild.id;
            newUser.avatar = msg.author.displayAvatarURL({ dynamic: true });
            newUser.tag = msg.author.tag;
            newUser.balance = balGain;
            await userRepo.save(newUser);
        } else {
            user.uid = msg.author.id;
            user.serverId = msg.guild.id;
            user.avatar = msg.author.displayAvatarURL({ dynamic: true });
            user.tag = msg.author.tag;
            user.balance += balGain;

            xpTimeout.set(`${msg.author.id}messageEarn`, "1");
            setTimeout(() => {
                xpTimeout.delete(`${msg.author.id}messageEarn`);
            }, 5 * 2000);
            await userRepo.save(user);
        }
    }

    return undefined;

}