import { Command } from "../../interfaces";
import { rolePerms } from "../../globals";

export const command: Command = {
    cooldown: 3,
    description: "I can say whatever the user wants!",
    example: ["!say chino is my favourite youtuber!!111!"],
    group: "boosters",
    guildOnly: true,
    name: "say",
    permissionsBot: rolePerms,
    staffOnly: true,
    // eslint-disable-next-line sort-keys
    run: async ({ client, msg, args }) => {

        let runFail = false;

        if (args.length === 0 && [...msg.attachments.values()].length === 0) runFail = true;

        if (runFail) return client.embedReply(msg, { embed: { description: "No message or attachment provided" } });

        if (args.length === 0) await client.reply(msg, { files: [...msg.attachments.values()] });

        else await client.reply(msg, { content: args.join(" "), "files": [...msg.attachments.values()] });


        await msg.delete();
    }
};
