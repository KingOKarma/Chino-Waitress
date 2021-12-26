/* eslint-disable @typescript-eslint/member-ordering */
import { Message, PermissionResolvable } from "discord.js";
import Client from "../client/client";

type Run = (client: Client, message: Message, args: string[]) => void;

export default interface Command {
    boosterOnly?: boolean;
    staffOnly?: boolean;
    cooldown?: number;
    cooldownResponse?: string;
    name: string;
    description: string;
    dmOnly?: boolean;
    guildOnly?: boolean;
    devonly?: boolean;
    example: string[];
    aliases?: string[];
    permissionsUser?: PermissionResolvable[];
    permissionsBot?: PermissionResolvable[];
    group: string;
    run: Run;

}
