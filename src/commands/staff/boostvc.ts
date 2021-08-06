import * as commando from "discord.js-commando";
import { STORAGE, rolePerms } from "../../bot/globals";
import { addVc, listVcs, removeVc } from "../../bot/utils/vcs";
import { Message } from "discord.js";

export default class BoosterListCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            args: [
                {
                    default: "",
                    key: "choice",
                    oneOf: ["add", "remove", "list"],
                    prompt: "Add, Remove or List",
                    type: "string"
                },
                {
                    default: "",
                    key: "vcID",
                    prompt: "I need a VC ID to add/remove to/from",
                    type: "string"
                }
            ],

            clientPermissions: rolePerms,
            description: "Lets you decide to add, remove, or list the boosters roles",
            group: "staff",
            guildOnly: true,
            memberName: "boosters",
            name: "boosters",
            throttling: {
                duration: 5,
                usages: 3
            },
            userPermissions: rolePerms
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { choice, vcID }: { choice: string; vcID: string; }
    ): Promise<Message | Message[]> {
        switch (choice.toLowerCase()) {
            case "add":
                return addVc(msg, vcID, STORAGE.allowedRoles);

            case "remove":
                return removeVc(msg, vcID, STORAGE.allowedRoles);

            case "list":
                return listVcs(msg, STORAGE.allowedRoles, "Booster Vcs");

            default:
                return msg.reply("Please give a choice\n`add <vc>`, `remove <vc>`, `list`");
        }
    }
}
