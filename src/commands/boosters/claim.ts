import { CONFIG, STORAGE, rolePerms } from "../../globals";
import { Command } from "../../interfaces";
import { getRole } from "../../utils/getRole";


export const command: Command = {
    // Note aliases are optional
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
    run: async ({ client, msg, args }) => {

        const [number] = args;
        if (!msg.member) return;

        const checkNum = new RegExp("^[0-9]+$");
        if (!checkNum.exec(number)) {
            const roleList = STORAGE.colourRoles.map((list: string, index: number) => `${index + 1} - <@&${list}>\n`);

            return client.embedReply(msg, {
                embed: {
                    author: { iconURL: msg.author.displayAvatarURL({ dynamic: true }), name: msg.author.tag },
                    title: "Your Claimable Rewards",
                    description: `${roleList.join("")}\n \`Using ${CONFIG.prefix}claim <number>\``,
                    footer: { text: "You can also get these roles by becoming a booster today!" }
                }
            });
        }

        const roleIndex = Number(number) - 1;
        const role = STORAGE.colourRoles[roleIndex];
        const roleInstance = await getRole(role, msg.guild);

        if (!roleInstance) {
            return client.embedReply(msg, { "embed": { description: "That role does not exist" } });
        }

        if (msg.member.roles.cache.get(role)) {
            return client.embedReply(msg, { "embed": { description: `You already have the \`${roleInstance.name}\` role` } });
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

        return client.embedReply(msg, {
            embed: {
                author: { iconURL: msg.author.displayAvatarURL({ dynamic: true }), name: msg.author.tag },
                title: `You have just Claimed the ${roleInstance.name} Role`,
                description: `**${msg.author.tag}** has claimed ${roleInstance}\nYou`
                    + ` can remove ${roleInstance} with \`${CONFIG.prefix}remove <number>\``,
                footer: { "text": "You can also get these roles by becoming a booster today!" }
            }
        });
    }
};
