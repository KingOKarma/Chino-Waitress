import * as commando from "discord.js-commando";
import { CONFIG, STORAGE, rolePerms } from "../../bot/globals";
import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
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
    ): Promise<Message | Message[] | null> {
        const perms = checkRoles(msg.member, STORAGE.allowedRoles);
        if (!perms) {
            return msg.say(`You do not have permission to use this command ${msg.member},\n`
        + `use \`${CONFIG.prefix}booster list\` to check who can use the command!`);
        }

        const member = await getMember(memberID, msg.guild);

        if (member === null) {
            return msg.say("I Could not find that user");
        }

        if (member.id === msg.author.id) return msg.say("Why would you move yourself into your own vc?");

        const boosterVC = STORAGE.boosterVcs.find((v) => v === msg.member.voice.channelID);

        if (boosterVC === undefined) {
            return msg.say("Please make sure you are in one of the booster Voice Channels!");
        }

        const vc = msg.guild.channels.resolve(boosterVC);

        if (vc === null)
            return msg.say("There was an internal error please contact staff");

        const otherVc = msg.guild.channels.cache.get(member.voice.channelID ?? "000");

        if (otherVc === undefined) {
            return msg.say(`${member.user.tag} is not in a VC to be dragged in from`);
        }

        const newMessage = await msg.channel.send(`${member}, Would you like to be dragged into ${vc.name} by ${msg.author}?`);

        await newMessage.react("✅");
        await newMessage.react("❌");

        const filter = (reaction: MessageReaction, user: User ): boolean => {
            return reaction.emoji.name === "✅" || reaction.emoji.name === "❌" && user.id === msg.author.id;
        };


        const reactionCollector = newMessage.createReactionCollector(filter, { time: 30000 });

        reactionCollector.on("collect", async (reaction, user) => {
            if (reaction.emoji.name === "✅") {

                const newcheck = msg.guild.channels.cache.get(member.voice.channelID ?? "000");

                if (newcheck === undefined) {
                    return msg.say(`${user} Please ensure you are in a vc to be dragged from`);
                }

                await member.voice.setChannel(vc);

                const embed = new MessageEmbed()
                    .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
                    .setTitle("Booster Move!")
                    .setDescription(`I just moved ${member} into ${vc.name} by ${msg.author}`)
                    .setTimestamp();
                reactionCollector.stop();

                return msg.say(embed);

            } else if (reaction.emoji.name === "❌") {
                reactionCollector.stop();
                return msg.say(`${msg.author}, They have declined your offer`);

            }
            reactionCollector.on("end", async () => {
                return msg.say("The offer timed out, please try again when you want");

            });
        });
        return null;

    }
}
