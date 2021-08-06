import * as commando from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { checkRoles, getMember } from "../../bot/utils/utils";
import { CONFIG } from "../../bot/globals";

// Creates a new class (being the command) extending off of the commando client
export default class UserInfoCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["whois", "member"],
            args: [
                {
                    key: "memberID",
                    prompt: "I need a member mention, or ID",
                    type: "string"
                }
            ],

            clientPermissions: ["MANAGE_MESSAGES"],
            description: "I'll give you some info on any user",
            group: "boosters",
            guildOnly: true,
            memberName: "userinfo",
            name: "userinfo",

            throttling: {
                duration: 5,
                usages: 3
            },

            userPermissions: ["MANAGE_MESSAGES"]
        });
    }

    // Now to run the actual command, the run() parameters need to be defiend (by types and names)
    public async run(
        msg: commando.CommandoMessage,
        { memberID }: { memberID: string; }
    ): Promise<Message | Message[]> {
        const perms = checkRoles(msg.member, CONFIG.allowedRoles);
        if (!perms) {
            return msg.say(`You do not have permission to use this command ${msg.member},\n`
        + `use \`${CONFIG.prefix}booster list\` to check who can use the command!`);
        }
        // Responds with whatever the user has said.
        const member = await getMember(memberID, msg.guild);

        if (member === null) {
            return msg.reply("Sorry I cannot find that user!");
        }

        const embed = new MessageEmbed()
            .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
            .setTitle("Info")
            .setDescription(`Created account at ${member.user.createdAt.toLocaleString("en-US")}`);

        return msg.say(embed);
    }
}
