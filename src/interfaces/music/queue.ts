import { AudioResource, VoiceConnection } from "@discordjs/voice";
import { TextChannel, VoiceBasedChannel } from "discord.js";

export interface Queue {
    textChannel: TextChannel;
    channel: VoiceBasedChannel;
    connection: null | VoiceConnection;
    songs: Songs[];
    loop: boolean;
    volume: number;
    muted: boolean;
    playing: boolean;
    audioResource: null | AudioResource;
}

export interface Songs {
    title: string;
    duration: number;
    url: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    permalink_url?: string;
    durationSeconds?: number;
    shortURL?: string;
    thumbnail?: string;
}