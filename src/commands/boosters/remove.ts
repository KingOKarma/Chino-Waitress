import { CONFIG, STORAGE, rolePerms } from "../../globals";
import { Command } from "../../interfaces";
import { getRole } from "../../utils/getRole";


export const command: Command = {
    // Note aliases are optional
    boosterOnly: true,
    cooldown: 3,
    description: "remove's boosters their special roles!",
    example: ["!remove 1"],
    group: "boosters",
    guildOnly: true,
    name: "removeclaim",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {
        const [number] = args;
        if (!msg.guild) return;

        const checkNum = new RegExp("^[0-9]+$");
        if (!checkNum.exec(number)) {
            const roleList = STORAGE.colourRoles.map((list, index) => `${index + 1} - <@&${list}>\n`);

            return client.embedReply(msg, {
                embed: {
                    author: { iconURL: msg.author.displayAvatarURL({ dynamic: true }), name: msg.author.tag },
                    title: "List of roles to remove",
                    description: `${roleList.join("")}\n \`Using ${CONFIG.prefix}remove <number>\``,
                    footer: { text: "You can also get these roles by becoming a booster today!" }
                }
            });
        }
        const roleIndex = Number(number) - 1;
        const role = STORAGE.colourRoles[roleIndex];
        const roleInstance = await getRole(role, msg.guild);

        if (roleInstance === null) {
            return client.embedReply(msg, { embed: { description: "That role does not exist" } });
        }

        if (!msg.member?.roles.cache.get(role)) {
            return client.embedReply(msg, { embed: { description: `You do not have the \`${roleInstance.name}\` role` } });
        }

        await msg.member.roles.remove(roleInstance, "They used their booster perks to remove a role");


        return client.embedReply(msg, {
            embed: {
                author: { iconURL: msg.author.displayAvatarURL({ dynamic: true }), name: msg.author.tag },
                description: `I have removed the ${roleInstance} from **${msg.author.tag}**\n`
                    + `You can claim any other role with \`${CONFIG.prefix}claim <number>\``,
                footer: { text: "You can also get these roles by becoming a booster today!" }
            }
        });
    }
};
