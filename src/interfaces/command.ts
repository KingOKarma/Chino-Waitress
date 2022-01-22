/* eslint-disable @typescript-eslint/member-ordering */
import { Message, PermissionResolvable } from "discord.js";
import ExtendedClient from "../client/client";

interface CommandStruc {
    client: ExtendedClient;
    msg: Message;
    args: string[];
}

type Run = (command: CommandStruc) => void;

export default interface Command {
    boosterOnly?: boolean;
    staffOnly?: boolean;
    cooldown?: number;
    cooldownResponse?: string;
    name: string;
    description: string;
    dmOnly?: boolean;
    djMode?: boolean;
    guildOnly?: boolean;
    devonly?: boolean;
    example: string[];
    aliases?: string[];
    permissionsUser?: PermissionResolvable[];
    permissionsBot?: PermissionResolvable[];
    group: string;
    run: Run;

}
