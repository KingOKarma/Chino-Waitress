import { CONFIG, STORAGE, rolePerms } from "../../globals";
import { Command } from "../../interfaces";
import { MessageEmbed } from "discord.js";
import { getRole } from "../../utils/getRole";


export const command: Command = {
    // Note aliases are optional
    aliases: ["get", "role"],
    boosterOnly: true,
    cooldown: 3,
    cooldownResponse: "Hey there slow down on your roles and wait another {time}",
    description: "Give's boosters their special roles!",
    example: ["!claim 2"],
    group: "boosters",
    guildOnly: true,
    name: "claim",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {

        const [number] = args;
        if (!msg.member) return;

        const checkNum = new RegExp("^[0-9]+$");
        if (!checkNum.exec(number)) {
            const roleList = STORAGE.colourRoles.map((list: string, index: number) => `${index + 1} - <@&${list}>\n`);

            const embed = new MessageEmbed()
                .setAuthor({ "iconURL": msg.author.displayAvatarURL({ dynamic: true }), "name": msg.author.tag })
                .setTitle("Your Claimable Rewards:")
                .setDescription(`${roleList.join("")}\n \`Using ${CONFIG.prefix}claim <number>\``)
                .setFooter("You can also get these roles by becoming a booster today!");

            return client.reply(msg, { embeds: [embed] });
        }

        const roleIndex = Number(number) - 1;
        const role = STORAGE.colourRoles[roleIndex];
        const roleInstance = await getRole(role, msg.guild);

        if (!roleInstance) {
            return client.reply(msg, { "content": "That role does not exist" });
        }

        if (msg.member.roles.cache.get(role)) {
            return client.reply(msg, { "content": `You already have the \`${roleInstance.name}\` role` });
        }

        const memRoles = msg.member.roles.cache;

        const foundColourRole = memRoles.some((cRoleID) => STORAGE.colourRoles.includes(cRoleID.id));

        if (foundColourRole) {
            STORAGE.colourRoles.forEach(async (cRole) => {
                const memberRoles = msg.member?.roles.cache;
                const invalidRole = memberRoles?.get(cRole);
                if (invalidRole) {
                    try {
                        await msg.member?.roles.remove(cRole, "Switching out colours");
                    } catch {
                        console.log(`Missing perms to remove colour roles from ${msg.member?.user.tag}`);
                    }
                }
            });
        }

        await msg.member.roles.add(roleInstance, "They used their booster perks");

        const embed = new MessageEmbed()
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
            .setTitle(`You have just Claimed the ${roleInstance.name} Role`)
            .setDescription(`**${msg.author.tag}** has claimed ${roleInstance}\nYou`
                + ` can remove ${roleInstance} with \`${CONFIG.prefix}remove <number>\``)
            .setFooter("You can also get these roles by becoming a booster today!");

        return client.reply(msg, { embeds: [embed] });
    }
};
