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
    bot.registry.registerGroups([
        ["boosters"],
        ["staff"],
        ["economy"]
    ]).registerDefaults()
        .registerCommandsIn(
            path.join(__dirname, "commands")
        );

    await bot.login(CONFIG.token);
}

main().catch(console.error);
