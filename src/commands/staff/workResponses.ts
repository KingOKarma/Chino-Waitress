import { STORAGE, rolePerms } from "../../globals";
import {
    addList,
    listList,
    removeList
} from "../../utils/lists/lists";
import { Command } from "../../interfaces";

export const command: Command = {
    aliases: ["workstrings", "ws"],
    cooldown: 3,
    description: "Lets you decide to add, remove, or list the Work responses",
    example: ["!workstring add user just got {bal} donuts!", "!workstring remove 2", "!workstring list 2"],
    group: "staff",
    guildOnly: true,
    name: "workstring",
    permissionsBot: rolePerms,
    staffOnly: true,
    // eslint-disable-next-line sort-keys
    run: async (client, msg, args) => {
        const [choice, string] = args;
        if (!msg.guild) return;

        switch (choice ? choice.toLowerCase() : "none") {
            case "add":
                return addList(client, msg, string, STORAGE.workResponses, []);

            case "remove":
                return removeList(client, msg, string, STORAGE.workResponses);

            case "list":
                return listList(client, msg, STORAGE.workResponses, "Work Responses");

            default:
                return msg.reply("Please give a choice `add <string>`, `remove <number>`, `list`");
        }
    }
};
