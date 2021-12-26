import { CONFIG, STORAGE, rolePerms } from "../../globals";
import { Command } from "../../interfaces";
import { MessageEmbed } from "discord.js";
import { getRole } from "../../utils/getRole";


export const command: Command = {
    // Note aliases are optional
    aliases: ["vc", "move"],
    boosterOnly: true,
    cooldown: 3,
    description: "remove's boosters their special roles!",
    example: ["!remove 1"],
    group: "boosters",
    guildOnly: true,
    name: "remove",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {
        const [number] = args;
        if (!msg.guild) return;

        const checkNum = new RegExp("^[0-9]+$");
        if (!checkNum.exec(number)) {
            const roleList = STORAGE.colourRoles.map((list, index) => `${index + 1} - <@&${list}>\n`);

            const embed = new MessageEmbed()
                .setAuthor({ "iconURL": msg.author.displayAvatarURL({ dynamic: true }), "name": msg.author.tag })
                .setTitle("List of roles to remove:")
                .setDescription(`${roleList.join("")}\n \`Using ${CONFIG.prefix}remove <number>\``)
                .setFooter("You can also get these roles by becoming a booster today!");

            return client.reply(msg, { embeds: [embed] });
        }
        const roleIndex = Number(number) - 1;
        const role = STORAGE.colourRoles[roleIndex];
        const roleInstance = await getRole(role, msg.guild);

        if (roleInstance === null) {
            return client.reply(msg, { content: "That role does not exist" });
        }

        if (!msg.member?.roles.cache.get(role)) {
            return client.reply(msg, { content: `You do not have the \`${roleInstance.name}\` role` });
        }

        await msg.member.roles.remove(roleInstance, "They used their booster perks to remove a role");

        const embed = new MessageEmbed()
            .setAuthor({ "iconURL": msg.author.displayAvatarURL({ dynamic: true }), "name": msg.author.tag })
            .setDescription(`I have removed the ${roleInstance} from **${msg.author.tag}**\n`
            + `You can claim any other role with \`${CONFIG.prefix}claim <number>\``)
            .setFooter("You can also get these roles by becoming a booster today!");

        return client.reply(msg, { embeds: [embed] });
    }
};
