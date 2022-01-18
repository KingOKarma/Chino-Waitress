import { Command } from "../../interfaces";
import { rolePerms } from "../../globals";

export const command: Command = {
    cooldown: 3,
    description: "Evaluates JavaScript code.",
    example: ["eval 3 + 3", "eval console.log(\"aaa\")"],
    group: "dev",
    devonly: true,
    guildOnly: true,
    name: "eval",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg, args }) => {
        try {
            const evalcode = await eval(args.join(" "));
            await client.embedReply(msg, { embed: { description: `Code Evaluated.\n\`\`\`ts\n${evalcode}\`\`\`` } });

        } catch (error) {
            return client.embedReply(msg, { embed: { description: `Error:\n\`\`\`diff\n- ${error}\`\`\`` } });
        }

    }
};
