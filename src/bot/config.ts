/* eslint-disable camelcase */
import { safeDump, safeLoad } from "js-yaml";
import { CONFIG } from "./globals";
import fs from "fs";

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
    private static readonly _configLocation = "./config.yml";

    public readonly owners: string[];

    public readonly prefix: string;

    public readonly token: string;


    public constructor() {
        this.owners = [""];
        this.token = "";
        this.prefix = "";
    }

    /**
       *  Call getConfig instead of constructor
       */
    public static getConfig(): Config {
        if (!fs.existsSync(Config._configLocation)) {
            throw new Error("Please create a config.yml");
        }
        const fileContents = fs.readFileSync(
            Config._configLocation,
            "utf-8"
        );
        const casted = safeLoad(fileContents) as Config;

        return casted;
    }

    /**
     * Safe the config to the config.yml default location
     */
    public static saveConfig(): void {
        fs.writeFileSync(Config._configLocation, safeDump(CONFIG));
    }
}
