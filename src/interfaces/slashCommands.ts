/* eslint-disable @typescript-eslint/member-ordering */
import { ApplicationCommandOptionData, CommandInteraction, PermissionResolvable } from "discord.js";
import Client from "../client/client";

type Run = (client: Client, interaction: CommandInteraction) => void;

export interface SlashCommands {
    boosterOnly?: boolean;
    staffOnly?: boolean;
    cooldown?: number;
    cooldownResponse?: string;
    name: string;
    description: string;
    dmOnly?: boolean;
    guildOnly?: boolean;
    options?: ApplicationCommandOptionData[];
    defaultPermission?: boolean;
    permissionsUser?: PermissionResolvable[];
    permissionsBot?: PermissionResolvable[];
    group: string;
    devOnly?: boolean;
    run: Run;

}
