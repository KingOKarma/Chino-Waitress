/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { EmbedFieldData, MessageActionRow, MessageButton, MessageEmbedOptions } from "discord.js";
import { Command } from "../../interfaces";
import { arrayPage } from "../../utils/arrayPage";
import { capitalize } from "../../utils/capitalize";
import { deleteButton } from "../../globals";

type HelpType = "page" | "cmd";

export const command: Command = {
    aliases: ["h"],
    description: "Get a list of all my commmands!",
    example: ["!help <page>", "!help <commandName>"],
    group: "Utility",
    name: "help",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg, args }) => {


        // eslint-disable-next-line prefer-destructuring
        let page = args[0];

        let pageOrCmd: HelpType = "page";

        if (!/^\+?(0|[1-9]\d*)$/.exec(args[0])) pageOrCmd = "cmd";


        if (args.length === 0) {
            pageOrCmd = "page";
            page = "1";
        }

        switch (pageOrCmd) {
            case "page": {

                const sortedCommands = [...client.commands.values()].sort((a, b) => a.group > b.group ? 1 : b.group > a.group ? -1 : 0);

                const commands = arrayPage(sortedCommands, 4, Number(page));

                let finalPage = 1;
                let notMax = false;
                while (!notMax) {
                    const cmds = arrayPage(sortedCommands, 4, finalPage);
                    if (cmds.length !== 0) {
                        finalPage++;
                    } else {
                        notMax = true;
                    }
                }
                finalPage -= 1;
                const fields: EmbedFieldData[] = [];

                if (commands.length === 0) {
                    fields.push({ name: "Empty", value: "> This page is emtpy!" });
                } else {
                    commands.forEach((cmd) => {

                        let aliases = "";

                        if (cmd.aliases !== undefined) aliases = `> **Aliases:** ${cmd.aliases.map((a) => `\`${a}\``)}`;

                        fields.push({
                            name: capitalize(cmd.name),
                            value: `${`> **Description:** ${cmd.description} \n`
                                + `> **Group:** ${capitalize(cmd.group)}\n`
                                + `> **Example usage:** ${cmd.example.map((a) => `\`${a}\``).join(", ")}\n`}${aliases}`
                        });

                    });
                }

                const embed: MessageEmbedOptions = {
                    title: `${client.user?.tag}'s ${client.commands.size} Commands`,
                    timestamp: msg.createdTimestamp,
                    footer: { text: `Page ${page} of ${finalPage} pages` },
                    fields
                };


                const first = new MessageButton()
                    .setCustomId("helpfirstpage")
                    .setEmoji("⏮️")
                    .setLabel("1")
                    .setStyle("SECONDARY");

                const last = new MessageButton()
                    .setCustomId("helplastpage")
                    .setEmoji("⏭️")
                    .setLabel(`${finalPage}`)
                    .setStyle("SECONDARY");

                const left = new MessageButton()
                    .setCustomId("helpbackpage")
                    .setEmoji("◀️")
                    .setLabel((Number(page) - 1).toString())
                    .setStyle("PRIMARY");

                if (Number(page) - 1 === 0) left.setDisabled(true);


                const right = new MessageButton()
                    .setCustomId("helpforwardpage")
                    .setEmoji("▶️")
                    .setLabel((Number(page) + 1).toString())
                    .setStyle("PRIMARY");
                if (Number(page) === finalPage) right.setDisabled(true);


                if (commands.length === 0) {
                    right.setDisabled(true);
                }

                if (page === "0") {
                    left.setDisabled(true);
                    right.setDisabled(false);
                }

                const button = new MessageActionRow()
                    .addComponents(
                        first, left, right, last, deleteButton
                    );

                const otherButton = new MessageActionRow()
                    .addComponents(
                        deleteButton
                    );

                if (Number(page) > finalPage) {
                    return client.embedReply(msg, { components: [otherButton], embed }).then(() => {
                        if (msg.deletable) return msg.delete();
                    });
                }

                return client.embedReply(msg, { components: [button], embed }).then(() => {
                    if (msg.deletable) return msg.delete();
                });

            }

            case "cmd": {

                const cmd = [...client.commands.values()].find((c) => {
                    if (c.aliases !== undefined) {
                        const alias = c.aliases.findIndex((a) => a === args[0]);

                        if (alias === -1) {
                            return c.name === args[0];
                        }

                        return c.aliases[alias];

                    }
                    return c.name === args[0];
                });

                let embed: MessageEmbedOptions = {};


                if (cmd === undefined) {
                    embed = {
                        title: "Command not found",
                        timestamp: msg.createdTimestamp
                    };

                    return client.embedReply(msg, { embed }).then(() => {
                        if (msg.deletable) return msg.delete();
                    });

                }

                let aliases = "";

                if (cmd.aliases !== undefined) aliases = `\n> \n> **Aliases:** ${cmd.aliases.map((a) => `\`${a}\``)}`;

                embed = {
                    title: `${capitalize(cmd.name)}'s Details`,
                    timestamp: msg.createdTimestamp,
                    description:
                        `> **Description:** ${cmd.description}\n> \n`
                        + `> **Group:** ${capitalize(cmd.group)}\n> \n`
                        + `> **Example Usage:** ${cmd.example.map((a) => `\`${a}\``).join(", ")}`
                        + `${aliases}`
                };

                const button = new MessageActionRow()
                    .addComponents(
                        deleteButton
                    );

                return msg.reply({ components: [button], embeds: [embed] }).then(() => {
                    if (msg.deletable) return msg.delete();
                });

            }
        }
    }
};
