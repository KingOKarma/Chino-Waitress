import "reflect-metadata";
import { onMemberUpdate, onMessage, onReady } from "./bot/events";
import { CONFIG } from "./bot/globals";
import { CommandoClient } from "discord.js-commando";
import { createConnection } from "typeorm";
import path from "path";

async function main(): Promise<void> {
    await createConnection();
    const bot = new CommandoClient({
        commandPrefix: CONFIG.prefix,
        owner: CONFIG.owners

    });

    // Runs the function defined in ./events
    bot.on("ready", () => void onReady(bot));

    bot.on("guildMemberUpdate", onMemberUpdate);

    bot.on("message", onMessage);

    // Registers all groups/commands/etc
    bot.registry.registerDefaultTypes()
        .registerGroups([
            ["boosters", "Boosters - Commands for all boosters to use freely"],
            ["staff", "Staff - These commands may only be used by staff members"],
            ["economy", "Economy - These Commands are focused on the economy side of things"]
        ]).registerDefaultGroups()
        .registerDefaultCommands({
            unknownCommand: false
        })

        .registerCommandsIn(
            path.join(__dirname, "commands")
        );

    await bot.login(CONFIG.token);
}

main().catch(console.error);
