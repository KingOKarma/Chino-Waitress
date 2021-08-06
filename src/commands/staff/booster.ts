import * as commando from "discord.js-commando";
import { STORAGE, rolePerms } from "../../bot/globals";
import {
    addRole,
    listRoles,
    removeRole
} from "../../bot/utils/roles";
import { Message } from "discord.js";

export default class BoosterListCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["booster", "b"],
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
                    key: "roleID",
                    prompt: "I need a role to add/remove to/from",
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
        { choice, roleID }: { choice: string; roleID: string; }
    ): Promise<Message | Message[]> {
        switch (choice.toLowerCase()) {
            case "add":
                return addRole(msg, roleID, STORAGE.allowedRoles, STORAGE.colourRoles);

            case "remove":
                return removeRole(msg, roleID, STORAGE.allowedRoles, STORAGE.colourRoles);

            case "list":
                return listRoles(msg, STORAGE.allowedRoles, "Booster Roles");

            default:
                return msg.reply("Please give a choice\n`add <role>`, `remove <role>`, `list`");
        }
    }
}
