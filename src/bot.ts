import Client from "./client/client";

void new Client({
    intents: ["GUILD_MESSAGES", "GUILDS", "GUILD_BANS", "GUILD_MEMBERS", "DIRECT_MESSAGES", "GUILD_VOICE_STATES", "GUILD_MESSAGE_REACTIONS"]
}).init().catch(console.error);
