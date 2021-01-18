/* eslint-disable camelcase */
import fs from 'fs';
import { safeDump, safeLoad } from 'js-yaml';
import { CONFIG } from './globals';

/**
 * This represents the config.yml
 * @class Config
 * @property {string} db_host
  *@property {number} db_port
  *@property {string} db_user
  *@property {string} db_pass
 * @property {string} token
 * @property {string} prefix
 * @property {string[]} allowedRoles
 * @property {string[]} colourRoles
 * @property {string[]} owners
 * @property {string} boosterChannel
 * @property {string} mutedRole
 * @property {string[]} workResponses
 */
export default class Config {
    public readonly db_host: string;

    public readonly db_port: number;

    public readonly db_user: string;

    public readonly db_pass: string;

    public readonly token: string;

    public readonly prefix: string;

    public readonly allowedRoles: string[];

    public readonly colourRoles: string[];

    public readonly owners: string[];

    public readonly boosterChannel: string;

    public readonly mutedRole: string;

    public readonly workResponses: string[];

    private static LOCATION = './config.yml';

    constructor() {
      this.db_host = '';
      this.db_port = 0;
      this.db_user = '';
      this.db_pass = '';
      this.token = '';
      this.prefix = '';
      this.allowedRoles = [''];
      this.colourRoles = [''];
      this.owners = [''];
      this.boosterChannel = '';
      this.mutedRole = '';
      this.workResponses = [''];
    }

    /**
       *  Call getConfig instead of constructor
       */
    public static getConfig(): Config {
      if (!fs.existsSync(Config.LOCATION)) {
        throw new Error('Please create a config.yml');
      }
      const fileContents = fs.readFileSync(
        Config.LOCATION,
        'utf-8',
      );
      const casted = safeLoad(fileContents) as Config;

      return casted;
    }

    /**
     * Safe the config to the config.yml default location
     */
    public static saveConfig() {
      fs.writeFileSync(Config.LOCATION, safeDump(CONFIG));
    }
}
