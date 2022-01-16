import { CONFIG, rolePerms } from "../../globals";
import { Command } from "../../interfaces";
import Config from "../../config";

export const command: Command = {
    cooldown: 5,
    description: "Toggle pruning of bot messages",
    example: ["!pruning"],
    group: "music",
    guildOnly: true,
    name: "pruning",
    permissionsBot: rolePerms,
    staffOnly: true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, msg, args) => {

        if (CONFIG.music.pruning)
            CONFIG.music.pruning = false;
        else {
            CONFIG.music.pruning = true;

        }

        Config.saveConfig();

        return client.embedReply(msg, { embed: { description: `Message pruning is ${CONFIG.music.pruning ? "**enabled**" : "**disabled**"}` } }).catch(console.error);

    }
};
