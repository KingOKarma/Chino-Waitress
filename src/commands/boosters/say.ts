import { Command } from "../../interfaces";
import { rolePerms } from "../../globals";

export const command: Command = {
    aliases: ["s", "sentence"],
    cooldown: 3,
    description: "I can say whatever the user wants!",
    example: ["!say owo chino is my favourite youtuber!!111!"],
    group: "boosters",
    guildOnly: true,
    name: "say",
    permissionsBot: rolePerms,
    staffOnly: true,
    // eslint-disable-next-line sort-keys
    run: async (client, msg, args) => {

        await client.reply(msg, { content: args.join(" "), "files": [...msg.attachments.values()] });
        await msg.delete();
    }
};
