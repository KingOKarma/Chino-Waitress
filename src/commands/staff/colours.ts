import * as commando from "discord.js-commando";
import { CONFIG, rolePerms } from "../../bot/globals";
import {
    addRole,
    listRoles,
    removeRole
} from "../../bot/utils/roles";
import { Message } from "discord.js";

export default class ColourListCommand extends commando.Command {
    public constructor(client: commando.CommandoClient) {
        super(client, {
            aliases: ["colors", "color", "colour", "c"],
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
            description: "Lets you decide to add, remove, or list the boosters colours roles",
            group: "staff",
            guildOnly: true,
            memberName: "colours",
            name: "colours",
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
                return addRole(msg, roleID, CONFIG.colourRoles, CONFIG.allowedRoles);

            case "remove":
                return removeRole(msg, roleID, CONFIG.colourRoles, CONFIG.allowedRoles);

            case "list":
                return listRoles(msg, CONFIG.colourRoles, "Booster Colour Roles");

            default:
                return msg.reply("Please give a choice\n`add <role>`, `remove <role>`, `list`");
        }
    }
}
