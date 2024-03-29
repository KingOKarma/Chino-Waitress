import { dump, load } from "js-yaml";
import { STORAGE } from "./globals";
import fs from "fs";

/**
 * This represents the storage.yml
 * @class Storage
 * @property {Servers} servers


 */
export default class Storage {
    private static readonly _configLocation = "./storage.yml";

    public allowedRoles: string[];

    public boosterChannel: string;

    public boosterVcs: string[];

    public colourRoles: string[];

    public mutedRole: string;

    public staffRoles: string[];

    public workResponses: string[];


    public constructor() {
        this.allowedRoles = [""];
        this.boosterChannel = "";
        this.boosterVcs = [""];
        this.colourRoles = [""];
        this.mutedRole = "";
        this.staffRoles = [""];
        this.workResponses = [""];
    }

    /**
       *  Call getConfig instead of constructor
       */
    public static getConfig(): Storage {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!fs.existsSync(Storage._configLocation)) {
            throw new Error("Please create a storage.yml");
        }
        const fileContents = fs.readFileSync(
            Storage._configLocation,
            "utf-8"
        );
        const casted = load(fileContents) as Storage;

        return casted;
    }

    /**
   *  Safe the config to the storage.yml default location
   */
    public static saveConfig(): void {
        fs.writeFileSync(Storage._configLocation, dump(STORAGE));
    }
}