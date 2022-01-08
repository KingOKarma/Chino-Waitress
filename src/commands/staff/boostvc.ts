import { STORAGE, rolePerms } from "../../globals";
import { addVc, listVcs, removeVc } from "../../utils/lists/vcs";
import { Command } from "../../interfaces";

export const command: Command = {
    cooldown: 3,
    description: "Lets you decide to add, remove, or list the boosters vcs",
    example: ["!boostvc add @role", "!boostvc remove 2", "!boostvc list 3"],
    group: "staff",
    guildOnly: true,
    name: "boostvc",
    permissionsBot: rolePerms,
    staffOnly: true,
    // eslint-disable-next-line sort-keys
    run: async (client, msg, args) => {
        const [choice, vcID] = args;
        if (!msg.guild) return;

        switch (choice ? choice.toLowerCase() : "none") {
            case "add":
                return addVc(client, msg, vcID, STORAGE.boosterVcs);

            case "remove":
                return removeVc(client, msg, vcID, STORAGE.boosterVcs);

            case "list":
                return listVcs(client, msg, STORAGE.boosterVcs, "Booster Vcs");

            default:
                return client.embedReply(msg, { embed: { description: "Please give a choice\n`add <vc>`, `remove <vc>`, `list`" } });
        }
    }
};
