import { CONFIG, STORAGE, rolePerms } from "../../globals";
import { Command } from "../../interfaces";
import { Guild } from "../../entity/guild";
import { MessageEmbed } from "discord.js";
import { User } from "../../entity/user";
import { getRepository } from "typeorm";
import ms from "ms";

const timeOut = new Map();


export const command: Command = {
    boosterOnly: true,
    cooldown: 3,
    description: "Work to become a world renowned worker",
    example: ["!use slinky"],
    group: "economy",
    guildOnly: true,
    name: "work",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, _args) => {
        if (!msg.guild) return;

        const devs = CONFIG.owners;

        const userRepo = getRepository(User);
        const guildRepo = getRepository(Guild);


        let guild = await guildRepo.findOne({ serverid: msg.guild.id });
        let user = await userRepo.findOne({ serverId: msg.guild.id, uid: msg.author.id });

        // If there is no Guild then add to  DB
        if (!guild) {
            const newGuild = new Guild();
            newGuild.serverid = msg.guild.id;
            newGuild.name = msg.guild.name;
            await guildRepo.save(newGuild);
            guild = newGuild;
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

        const isdev = devs.some((checkDev) => checkDev === msg.author.id);
        const timeout = 21600 * 1000;
        const key = `${msg.author.id}work`;
        const found = timeOut.get(key);

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (found && !isdev) {
            const timePassed = Date.now() - found;
            const timeLeft = timeout - timePassed;
            return client.reply(msg, { content: `**Whoa there you're a bit too fast there. you gotta wait another ${ms(timeLeft)}!**` });
        }

        const earn = Math.floor(Math.random() * 500 + 100);
        timeOut.set(key, Date.now());

        // 6 hours/1000 in miliseconds
        const HOURS = 21600;

        setTimeout(() => {
            timeOut.delete(`${msg.author.id}work`);
            // 6 hours
        }, HOURS * 1000);

        let response = STORAGE.workResponses[Math.floor(Math.random() * STORAGE.workResponses.length)];

        const bal = `**${earn}🍩**`;

        if (response.includes("{bal}")) {
            const replace = new RegExp("{bal}", "g");
            response = response.replace(replace, bal);
        }
        const embed = new MessageEmbed();

        embed.setAuthor({ "iconURL": msg.author.displayAvatarURL({ dynamic: true }), "name": msg.author.tag });
        embed.setTitle("Working Hours");
        embed.setDescription(response);
        embed.setFooter("Donuts Currency is only available for server boosters!");
        return client.reply(msg, { embeds: [embed] });
    }
};
