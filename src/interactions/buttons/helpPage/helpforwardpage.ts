import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import Buttons from "../../../interfaces/buttons";
import { arrayPage } from "../../../utils/arrayPage";
import { capitalize } from "../../../utils/capitalize";
import { deleteButton } from "../../../globals";

export const buttons: Buttons = {
    name: "helpforwardpage",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (client, interaction) => {
        const { component } = interaction;

        if (component === null) return;

        const { label } = new MessageButton(component);
        const sortedCommands = [...client.commands.values()].sort((a, b) => a.group > b.group ? 1 : b.group > a.group ? -1 : 0);

        const commands = arrayPage(sortedCommands, 4, Number(label));

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


        const embed = new MessageEmbed()
            .setTitle(`${client.user?.tag}'s ${client.commands.size} Commands`)
            .setTimestamp()
            .setColor(client.primaryColour)
            .setFooter({ text: `Page ${label} of ${finalPage} pages` });
        if (commands.length === 0) {
            embed.addField("Empty", "> This page is emtpy!");
        } else {
            commands.forEach((cmd) => {

                let aliases = "";

                if (cmd.aliases !== undefined) aliases = `> **Aliases:** ${cmd.aliases.map((a) => `\`${a}\``)}`;

                embed.addField(capitalize(cmd.name), `${`> **Description:** ${cmd.description} \n`
                    + `> **Group:** ${capitalize(cmd.group)}\n`
                    + `> **Example usage:** ${cmd.example.map((a) => `\`${a}\``).join(", ")}\n`}${aliases}`);

            });
        }

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
            .setLabel((Number(label) - 1).toString())
            .setStyle("PRIMARY");

        if (Number(label) - 1 === 0) left.setDisabled(true);


        const right = new MessageButton()
            .setCustomId("helpforwardpage")
            .setEmoji("▶️")
            .setLabel((Number(label) + 1).toString())
            .setStyle("PRIMARY");

        if (Number(label) === finalPage) right.setDisabled(true);

        if (commands.length === 0) {
            right.setDisabled(true);
        }

        const button = new MessageActionRow()
            .addComponents(
                first, left, right, last, deleteButton
            );

        await interaction.update({ components: [button], embeds: [embed] });
    }
};
