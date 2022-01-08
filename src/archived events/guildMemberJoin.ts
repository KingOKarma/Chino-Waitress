import { Event } from "../interfaces";
import { GuildMember } from "discord.js";


export const event: Event = {
    name: "guildMemberAdd",
    run: async (client, member: GuildMember) => {
        const { username } = member.user;
        const { guild } = member;
        if (username.includes("Clonex")) {
            await member.send({ "content": "You have been banned from Chinos for being a self-bot, please appeal here if this was a mistake:\n https://forms.gle/PmbrWsURvzcYmfgD6" });
            await guild.bans.create(member, { "reason": "Clonex Spamming Bot" });
        }
    }
};