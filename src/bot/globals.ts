import Config from "./config";
import { PermissionString } from "discord.js";
import Storage from "./storage";

export const CONFIG = Config.getConfig();

export const STORAGE = Storage.getConfig();

export const rolePerms: PermissionString[] = ["MANAGE_ROLES", "EMBED_LINKS"];
