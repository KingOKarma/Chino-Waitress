import Config from "./config";
import { PermissionString } from "discord.js";

export const CONFIG = Config.getConfig();

export const rolePerms: PermissionString[] = ["MANAGE_ROLES", "EMBED_LINKS"];
