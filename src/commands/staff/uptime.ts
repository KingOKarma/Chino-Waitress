import { Command } from "../../interfaces";
import { rolePerms } from "../../globals";

export const command: Command = {
    cooldown: 3,
    description: "Check the uptime",
    example: ["!uptime"],
    group: "staff",
    staffOnly: true,
    guildOnly: true,
    name: "uptime",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg }) => {
        if (client.uptime === null) return client.embedReply(msg, { embed: { description: "There was an Internal Error!" } } );
        const { uptime } = client;
        let seconds = Math.floor(uptime / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        seconds %= 60;
        minutes %= 60;
        hours %= 24;

        return client.embedReply(msg, { embed: { description: `Uptime: \`${days} day(s),${hours} hours, ${minutes} minutes, ${seconds} seconds\`` } }).catch(console.error);
    }
};
