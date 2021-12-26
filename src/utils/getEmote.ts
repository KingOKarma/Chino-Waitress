import { Emoji } from "discord.js";
import ExtendedClient from "../client/client";

/**
 * Used to check if a user has at least one role from a list, returns true if found
 * @param {string} emoteString The raw emote string
 * @param {Client} client The client that is initialised
 * @returns {Emoji | undefined} Either returns the emote or undefiend
 */
export function getEmote(emoteString: string, client: ExtendedClient): Emoji | undefined {
    // eslint-disable-next-line no-useless-escape
    if (!emoteString.match(/\:(.*?)\>/g)) {
        return undefined;
    }

    // eslint-disable-next-line no-useless-escape
    const findEmote = emoteString.slice(3).match(/\:.*?\>/g);
    if (findEmote === null) {
        return undefined;
    }

    const theMatch = findEmote[0].slice(1, -1);

    const emote = client.emojis.cache.get(theMatch);

    if (emote) {
        return emote;
    }

    return undefined;
}