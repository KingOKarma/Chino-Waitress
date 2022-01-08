import { CONFIG, STORAGE } from "../../globals";
import { Message, PermissionString } from "discord.js";
import ExtendedClient from "../../client/client";
import { checkRoles } from "../../utils/checkRoles";
import { formatPermsArray } from "../../utils/formatPermsArray";
import ms from "ms";


export async function commandHandler(client: ExtendedClient, msg: Message): Promise<void | Message> {
    if (msg.author.bot || !msg.guild || !msg.content.toLowerCase().startsWith(CONFIG.prefix)) return;

    const args = msg.content
        .slice(CONFIG.prefix.length)
        .trim()
        .split(/ +/g);

    const cmd = args.shift()?.toLowerCase();

    if (cmd === undefined) return;
    const command = client.commands.get(cmd) ?? client.aliases.get(cmd);
    if (command) {
        // Heres an example if you want a group called "managment" only be usable by admins:

        let shouldrun = true;
        let reason = "error";

        if (command.group === "managment") {
            if (msg.member?.permissions.has("ADMINISTRATOR") === false) {
                shouldrun = false;
                reason = "You must be an admin to run this command!";
            }
        }

        if (command.devonly === true) {
            if (CONFIG.owners.some((d) => d === msg.author.id)) {
                shouldrun = false;
                reason = "You must be a deveoper to run this command!";
            }
        }

        if (command.guildOnly ?? false) {
            if (!msg.member) {
                return client.embedReply(msg, { embed: { description: "This Command can only be used inside of servers!" } });
            }
        }

        if (command.dmOnly ?? false) {
            if (msg.member) {
                return client.embedReply(msg, { embed: { description: "This Command can only be used inside of DMs!" } });
            }
        }

        if (command.boosterOnly ?? false) {

            if (!checkRoles(msg.member, STORAGE.allowedRoles)) {
                return client.embedReply(msg, {
                    embed: {
                        description: `You do not have permission to use this command ${msg.member},\n`
                            + "This command is for server boosters only!"
                    }
                });
            }
        }

        if (command.staffOnly ?? false) {

            if (!checkRoles(msg.member, STORAGE.staffRoles)) {
                return client.embedReply(msg, {
                    embed: {
                        description: `You do not have permission to use this command ${msg.member},\n`
                            + "This command may only be used by staff members!"
                    }
                });
            }
        }

        const userPerms = formatPermsArray(command.permissionsUser as PermissionString[]);

        if (!(msg.member?.permissions.has(command.permissionsUser ?? []) ?? false)) {
            return client.embedReply(msg, { embed: { description: `You require! the permission(s)\n> ${userPerms}\nTo use this command` } });

        }

        const clientPerms = formatPermsArray(command.permissionsBot as PermissionString[]);

        if (!(msg.guild.me?.permissions.has(command.permissionsBot ?? []) ?? false)) {
            return client.embedReply(msg, { embed: { description: `I require! the permission(s)\n> ${clientPerms}\nTo use this command` } });

        }

        if (command.cooldown !== undefined) {
            const cooldown = client.cooldowns.get(`${command.name}/${msg.author.id}`);
            if (cooldown) {
                const timePassed = Date.now() - cooldown.timeSet;
                const timeLeft = command.cooldown * 1000 - timePassed;

                let response = `${command.cooldownResponse ?? `Hey you're going too fast, please wait another ${ms(timeLeft)}`}`;

                if (response.includes("{time}")) {
                    const replace = new RegExp("{time}", "g");
                    response = response.replace(replace, ms(timeLeft));
                }

                return client.embedReply(msg, { embed: { description: response } });
            }
            client.cooldowns.set(`${command.name}/${msg.author.id}`, {
                command: command.name,
                cooldownTime: command.cooldown,
                timeSet: Date.now(),
                userID: msg.author.id
            });

            setTimeout(() => {
                client.cooldowns.delete(`${command.name}/${msg.author.id}`);
            }, command.cooldown * 1000);
        }

        if (!shouldrun) return client.embedReply(msg, { embed: { description: reason } });

        command.run(client, msg, args);

    }
}