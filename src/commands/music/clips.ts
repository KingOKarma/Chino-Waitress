import { Command } from "../../interfaces";
import path from "path";
import { readdirSync } from "fs";
import { rolePerms } from "../../globals";


export const command: Command = {
    cooldown: 3,
    description: "List all clips",
    example: ["!clips"],
    group: "music",
    guildOnly: true,
    name: "clips",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {

        const soundsPath = path.join(__dirname, "..", "..", "..", "sounds");

        try {
            const files = readdirSync(soundsPath);

            const clips: string[] = [];

            files.forEach((file) => {
                clips.push(file.substring(0, file.length - 4));
            });

            client.embedReply(msg, { embed: { description: `${clips.join(", ")}` } }).catch(console.error);

        } catch (err) {
            return void console.error(`Unable to read directory: ${err}`);
        }

    }
};
