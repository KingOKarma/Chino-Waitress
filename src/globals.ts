/* eslint-disable sort-keys */
/* eslint-disable @typescript-eslint/member-ordering */
import { Collection, MessageButton, PermissionString } from "discord.js";
import Config from "./config";
import Storage from "./storage";

export const CONFIG = Config.getConfig();

export const STORAGE = Storage.getConfig();

export const rolePerms: PermissionString[] = ["MANAGE_ROLES", "EMBED_LINKS", "READ_MESSAGE_HISTORY", "SEND_MESSAGES", "MOVE_MEMBERS", "MANAGE_MESSAGES"];


export const commands = new Collection;

export const deleteButton = new MessageButton()
    .setCustomId("delete")
    .setLabel("❌")
    .setStyle("DANGER");


interface SlashCommandTypes {
    subCommand: number;
    subCommandGroup: number;
    string: number;
    integer: number;
    boolean: number;
    user: number;
    channel: number;
    role: number;
    mentionable: number;
    number: number;


}

export const slashCommandTypes: SlashCommandTypes = {
    subCommand: 1,
    subCommandGroup: 2,
    string: 3,
    integer: 4,
    boolean: 5,
    user: 6,
    channel: 7,
    role: 8,
    mentionable: 9,
    number: 10
};
