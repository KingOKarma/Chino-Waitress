import { STORAGE, rolePerms } from "../../globals";
import {
    addRole,
    listRoles,
    removeRole
} from "../../utils/lists/roles";
import { Command } from "../../interfaces";

export const command: Command = {
    aliases: ["booster", "b"],
    cooldown: 3,
    description: "Lets you decide to add, remove, or list the boosters roles",
    example: ["!boosters add @role", "!boosters remove 2", "!boosters list 3"],
    group: "staff",
    guildOnly: true,
    name: "boosters",
    permissionsBot: rolePerms,
    staffOnly: true,
    // eslint-disable-next-line sort-keys
    run: async ({ client, msg, args }) => {
        const [choice, roleID] = args;
        if (!msg.guild) return;

        switch (choice ? choice.toLowerCase() : "none") {
            case "add":
                return addRole(client, msg, roleID, STORAGE.allowedRoles, STORAGE.colourRoles);

            case "remove":
                return removeRole(client, msg, roleID, STORAGE.allowedRoles, STORAGE.colourRoles);

            case "list":
                return listRoles(client, msg, STORAGE.allowedRoles, "Booster Roles");

            default:
                return client.embedReply(msg, { embed: { description: "Please give a choice\n`add <role>`, `remove <role>`, `list`" } });
        }
    }
};
