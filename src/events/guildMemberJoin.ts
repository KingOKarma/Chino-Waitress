import { Event } from "../interfaces";
import { GuildMember } from "discord.js";


export const event: Event = {
    name: "guildMemberAdd",
    run: async (client, member: GuildMember) => {
        
    }
};