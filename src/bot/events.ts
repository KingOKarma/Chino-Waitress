import { Client, GuildMember, Message } from "discord.js";
import { CONFIG } from "./globals";
import { User } from "../entity/user";
import { checkRoles } from "./utils/utils";
import { Guild as entityGuild } from "../entity/guild";
import fs from "fs";
import { getRepository } from "typeorm";

export function onReady(bot: Client): void {
    if (!bot.user) {
        return;
    }
    console.log(`${bot.user.tag} Bot has started, with ${bot.users.cache.size} users, in ${bot.channels.cache.size} channels of ${bot.guilds.cache.size} guilds.`);

    void bot.user.setActivity("I'm still a work in progress owo!"); // Sets status

    setInterval(() => {
        if (!bot.user) {
            return;
        }
        // If you know a better way of getting this system to work feel free
        // To contact me.
        const files = fs.readdirSync("./src/pfps");

        const chosenFile = files[Math.floor(Math.random() * files.length)];

        bot.user.setAvatar(`./src/pfps/${chosenFile}`)
            .catch((err) => {
                console.log(err);
            });

        console.log(`Pfp has changed to \n${chosenFile}`);
    }, 86400000);

    // 86400000 = 24 hours
}

/**
 * Triggered when a member updates their profile info
 * @param {GuildMember} _ Old iteration of the member's profile (not needed)
 * @param {GuildMember} mem New iteration of the member's profile
 */
export async function onMemberUpdate(_: GuildMember, mem: GuildMember): Promise<void> {
    const check = mem.roles.cache.map((role) => role.id);

    // Loop over member roles to check if they have whitelisted roles
    const foundWhitelist = check.some((hasRole) => CONFIG.allowedRoles.includes(hasRole));

    const channel = mem.guild.channels.cache.get(CONFIG.boosterChannel);

    if (channel === undefined) {
        return;
    }

    if (!foundWhitelist) {
    // Loop over member roles to check if they have colour roles
        const foundColourRole = check.some((colorRoleId) => CONFIG.colourRoles.includes(colorRoleId));

        if (foundColourRole) {
            CONFIG.colourRoles.forEach(async (role) => {
                const memberRoles = mem.roles.cache;
                const invalidRole = memberRoles.get(role);
                if (invalidRole) {
                    try {
                        await mem.roles.remove(role, "Doesn't have required role");
                    } catch {
                        console.log(`Missing perms to remove colour roles from ${mem.user.tag}`);
                    }
                }
            });
        }
    }

    if (check.includes(CONFIG.mutedRole)) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        await channel.createOverwrite(mem, { SEND_MESSAGES: false }, "User Was muted");
    }

    if (!check.includes(CONFIG.mutedRole)) {
        const memberPerms = channel.permissionOverwrites.get(mem.user.id);

        if (memberPerms === undefined) {
            return;
        }

        await memberPerms.delete("No longer muted");
    }
}

const xpTimeout: Map<string, string> = new Map();

/**
 * Triggered when a message is sent
 * @param {Message} msg The Message Instance
 */
export async function onMessage(msg: Message): Promise<void> {
    if (msg.author.bot) return undefined;
    if (msg.guild === null) return undefined;
    if (msg.member === null) return undefined;

    const perms = checkRoles(msg.member, CONFIG.allowedRoles);
    if (!perms) {
        return undefined;
    }

    const userRepo = getRepository(User);
    const guildRepo = getRepository(entityGuild);

    let guild = await guildRepo.findOne({ serverid: msg.guild.id });
    const user = await userRepo.findOne({ serverId: msg.guild.id, uid: msg.author.id });
    const timeout = xpTimeout.get(`${msg.author.id}messageEarn`);
    const balGain = Math.floor(Math.random() * 7 + 2);

    // If there is no Guild then add to  DB
    if (!guild) {
    // eslint-disable-next-line new-cap
        const newGuild = new entityGuild();
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
