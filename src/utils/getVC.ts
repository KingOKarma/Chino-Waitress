import { Guild, VoiceChannel } from "discord.js";

/**
 * Used to check channel mentions/ID's if they are roles
 * @param {string} rid The role mention/ID (Optional)
 * @param {Guild} guild the Guild instance the of where the Role is from
 * @returns {Role} A Role instance or undefined
 */
export async function getVc(rid: string | undefined, guild: Guild | undefined): Promise<VoiceChannel | null> {
    if (typeof rid !== "string") return null;
    if (!(guild instanceof Guild)) return null;

    const vc = await guild.channels.fetch(rid);

    if (!vc) return null;
    if (vc.type !== "GUILD_VOICE") return null;

    return vc;
}