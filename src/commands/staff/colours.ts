import { STORAGE, rolePerms } from "../../globals";
import {
    addRole,
    listRoles,
    removeRole
} from "../../utils/lists/roles";
import { Command } from "../../interfaces";

export const command: Command = {
    aliases: ["colors", "color", "colour", "c"],
    cooldown: 3,
    description: "Lets you decide to add, remove, or list the boosters colours roles",
    example: ["!colours add @role", "!colours remove 2", "!colours list 3"],
    group: "staff",
    guildOnly: true,
    name: "colours",
    permissionsBot: rolePerms,
    staffOnly: true,
    // eslint-disable-next-line sort-keys
    run: async (client, msg, args) => {
        const [choice, roleID] = args;
        if (!msg.guild) return;

        switch (choice ? choice.toLowerCase() : "none") {
            case "add":
                return addRole(client, msg, roleID, STORAGE.colourRoles, STORAGE.allowedRoles);

            case "remove":
                return removeRole(client, msg, roleID, STORAGE.colourRoles, STORAGE.allowedRoles);

            case "list":
                return listRoles(client, msg, STORAGE.colourRoles, "Booster Colour Roles");

            default:
                return msg.reply("Please give a choice\n`add <role>`, `remove <role>`, `list`");
        }
    }
};
