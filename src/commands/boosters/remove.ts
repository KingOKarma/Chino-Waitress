import * as commando from "discord.js-commando";
import { CONFIG, rolePerms } from "../../bot/globals";
import { Message, MessageEmbed } from "discord.js";
import { checkRoles, getRole } from "../../bot/utils/utils";

// Creates a new class (being the command) extending off of the commando client
export default class RemoveCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            args: [
                {
                    default: "",
                    key: "number",
                    prompt: "I need a number eqaul to one of the roles in the list",
                    type: "string"
                }
            ],

            clientPermissions: rolePerms,
            description: "remove's boosters their special roles!",
            group: "boosters",
            guildOnly: true,
            memberName: "remove",
            name: "remove",

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
        const perms = checkRoles(msg.member, CONFIG.allowedRoles);
        if (!perms) {
            return msg.say(`You do not have permission to use this command ${msg.member},\n`
        + `use \`${CONFIG.prefix}booster list\` to check who can use the command!`);
        }

        const checkNum = new RegExp("/^[0-9]+$/");
        if (!checkNum.exec(number)) {
            const roleList = CONFIG.colourRoles.map((list, index) => `${index + 1} - <@&${list}>\n`);

            const embed = new MessageEmbed()
                .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
                .setTitle("Ths list of roles to remove:")
                .setDescription(roleList.join(""))
                .setFooter("You can also get these roles by becoming a booster today!");

            return msg.say(embed);
        }
        const roleIndex = Number(number) - 1;
        const role = CONFIG.colourRoles[roleIndex];
        const roleInstance = getRole(role, msg.guild);

        if (roleInstance === undefined) {
            return msg.say("That role does not exist");
        }

        if (!msg.member.roles.cache.get(role)) {
            return msg.say(`You do not have the \`${roleInstance.name}\` role`);
        }

        await msg.member.roles.remove(roleInstance, "They used their booster perks to remove a role");

        const embed = new MessageEmbed()
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
            .setTitle(`You have Just Removed the ${roleInstance.name} Role`)
            .setDescription(`You can claim any other role with \`${CONFIG.prefix}claim <number>\``)
            .setFooter("You can also get these roles by becoming a booster today!");

        return msg.say(embed);
    }
}
