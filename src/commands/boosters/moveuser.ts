import * as commando from "discord.js-commando";
import { CONFIG, STORAGE, rolePerms } from "../../bot/globals";
import { Message, MessageEmbed } from "discord.js";
import { checkRoles, getMember } from "../../bot/utils/utils";

// Creates a new class (being the command) extending off of the commando client
export default class MoveCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["vc", "move"],
            args: [
                {
                    key: "memberID",
                    prompt: "Which user would you like to drag into Boosters VC",
                    type: "string"
                }
            ],

            clientPermissions: rolePerms,
            description: "Allows boosters to ask normal users if they would like to be moved into the Boosters VC!",
            group: "boosters",
            guildOnly: true,
            memberName: "moveuser",
            name: "moveuser",
            throttling: {
                duration: 5,
                usages: 3
            }
        });
    }

    // Now to run the actual command, the run() parameters need to be defiend (by types and names)
    public async run(
        msg: commando.CommandoMessage,
        { memberID }: { memberID: string; }
    ): Promise<Message | Message[]> {
        const perms = checkRoles(msg.member, STORAGE.allowedRoles);
        if (!perms) {
            return msg.say(`You do not have permission to use this command ${msg.member},\n`
        + `use \`${CONFIG.prefix}booster list\` to check who can use the command!`);
        }

        const member = await getMember(memberID, msg.guild);

        if (member === null) {
            return msg.say("I Could not find that user");
        }

        const embed = new MessageEmbed()
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
            .setTitle("You have just Claimed the  Role")
            .setDescription(`You can remove the with \`${CONFIG.prefix}remove <number>\``)
            .setFooter("You can also get these roles by becoming a booster today!");

        return msg.say(embed);
    }
}
