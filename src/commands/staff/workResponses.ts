import * as commando from "discord.js-commando";
import { STORAGE, rolePerms } from "../../bot/globals";
import {
    addList,
    listList,
    removeList
} from "../../bot/utils/lists";
import { Message } from "discord.js";

export default class BoosterWorkResponse extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["workstrings", "ws"],
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
                    key: "string",
                    prompt: "I need a string to add to or number to remove from (max length 100 characters)",
                    type: "string",
                    validate: (text: string): boolean => text.length < 201
                }
            ],

            clientPermissions: rolePerms,
            description: "Lets you decide to add, remove, or list the Work responses roles",
            group: "staff",
            guildOnly: true,
            memberName: "workstring",
            name: "workstring",
            throttling: {
                duration: 5,
                usages: 3
            },
            userPermissions: rolePerms
        });
    }

    public async run(
        msg: commando.CommandoMessage,
        { choice, string }: { choice: string; string: string; }
    ): Promise<Message | Message[]> {
        switch (choice.toLowerCase()) {
            case "add":
                return addList(msg, string, STORAGE.workResponses, []);

            case "remove":
                return removeList(msg, string, STORAGE.workResponses);

            case "list":
                return listList(msg, STORAGE.workResponses, "Work Responses");

            default:
                return msg.reply("Please give a choice `add <string>`, `remove <number>`, `list`");
        }
    }
}
