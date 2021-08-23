import * as commando from "discord.js-commando";
import { CONFIG, STORAGE, rolePerms } from "../../bot/globals";
import { Message, MessageEmbed } from "discord.js";
import { checkRoles, getRole } from "../../bot/utils/utils";

// Creates a new class (being the command) extending off of the commando client
export default class ClaimCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["get", "role"],
            args: [
                {
                    default: "",
                    key: "number",
                    prompt: "I need a number eqaul to one of the roles in the list",
                    type: "string"
                }
            ],

            clientPermissions: rolePerms,
            description: "Give's boosters their special roles!",
            group: "boosters",
            guildOnly: true,
            memberName: "claim",
            name: "claim",
            throttling: {
                duration: 5,
                usages: 3
            }
        });
    }

    // Now to run the actual command, the run() parameters need to be defiend (by types and names)
    public async run(
        msg: commando.CommandoMessage,
        { number }: { number: string; }
    ): Promise<Message | Message[]> {
        const perms = checkRoles(msg.member, STORAGE.allowedRoles);
        if (!perms) {
            return msg.say(`You do not have permission to use this command ${msg.member},\n`
        + `use \`${CONFIG.prefix}booster list\` to check who can use the command!`);
        }

        const checkNum = new RegExp("^[0-9]+$");
        if (!checkNum.exec(number)) {
            const roleList = STORAGE.colourRoles.map((list: string, index: number) => `${index + 1} - <@&${list}>\n`);

            const embed = new MessageEmbed()
                .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
                .setTitle("Your Claimable Rewards:")
                .setDescription(`${roleList.join("")}\n \`Using ${CONFIG.prefix}claim <number>\``)
                .setFooter("You can also get these roles by becoming a booster today!");

            return msg.say(embed);
        }

        const roleIndex = Number(number) - 1;
        const role = STORAGE.colourRoles[roleIndex];
        const roleInstance = getRole(role, msg.guild);

        if (roleInstance === undefined) {
            return msg.say("That role does not exist");
        }

        if (msg.member.roles.cache.get(role)) {
            return msg.say(`You already have the \`${roleInstance.name}\` role`);
        }

        const memRoles = msg.member.roles.cache;

        const foundColourRole = memRoles.some((cRoleID) => STORAGE.colourRoles.includes(cRoleID.id));

        if (foundColourRole) {
            STORAGE.colourRoles.forEach(async (cRole) => {
                const memberRoles = msg.member.roles.cache;
                const invalidRole = memberRoles.get(cRole);
                if (invalidRole) {
                    try {
                        await msg.member.roles.remove(cRole, "Switching out colours");
                    } catch {
                        console.log(`Missing perms to remove colour roles from ${msg.member.user.tag}`);
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

        return msg.say(embed);
    }
}
