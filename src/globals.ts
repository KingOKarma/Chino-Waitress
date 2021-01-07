import { PermissionString } from 'discord.js';
import Config from './config';

export const CONFIG = Config.getConfig();

export const rolePerms: PermissionString[] = ['MANAGE_ROLES'];
