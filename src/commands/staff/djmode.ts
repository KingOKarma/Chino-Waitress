import { Command } from "../../interfaces";
import { Guild as DBGuild } from "../../entity/guild";
import { getRepository } from "typeorm";
import { rolePerms } from "../../globals";

export const command: Command = {
    cooldown: 3,
    description: "Toggles the music module to DJ only.",
    example: ["!djmode"],
    group: "staff",
    staffOnly: true,
    guildOnly: true,
    name: "djmode",
    permissionsBot: rolePerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async ({ client, msg }) => {
        const guildRepo = getRepository(DBGuild);

        const dbGuild = await guildRepo.findOne({ where: { serverid: msg.guildId } });

        if (!dbGuild) return client.embedReply(msg, { embed: { description: "There was an internal error!" } } );

        switch (dbGuild.djMode) {
            case true:
                dbGuild.djMode = false;
                await guildRepo.save(dbGuild);
                return client.embedReply(msg, { embed: { description: "DJ mode has been **disabled.**" } } );
            case false:
                dbGuild.djMode = true;
                await guildRepo.save(dbGuild);
                return client.embedReply(msg, { embed: { description: "DJ mode has been **enabled.**" } } );
        }

    }
};
