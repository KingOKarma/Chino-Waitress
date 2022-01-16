/* eslint-disable @typescript-eslint/member-ordering */
import "reflect-metadata";
import { Client, Collection, ColorResolvable, CommandInteraction, GuildMember, Message, MessageEmbed } from "discord.js";
import { Command, Event } from "../interfaces/index";
import { createConnection, getRepository } from "typeorm";
import fs, { readdirSync } from "fs";
import { Bot } from "../entity/bot";
import Buttons from "../interfaces/buttons";
import { CONFIG } from "../globals";
import { Cooldowns } from "../interfaces/cooldown";
import { EmbedReplyEmbedArguments } from "../interfaces/functionInterfaces/embedReplyCommand";
import { Queue } from "../interfaces/music/queue";
import { ReplyEmbedArguments } from "../interfaces/functionInterfaces/replyCommand";
import SelectMenus from "../interfaces/selectMenus";
import { SlashCommands } from "../interfaces/slashCommands";
import { getVoiceConnection } from "@discordjs/voice";
import path from "path";

class ExtendedClient extends Client {

    // Handlers
    public commands: Collection<string, Command> = new Collection();
    public events: Collection<string, Event> = new Collection();
    public aliases: Collection<string, Command> = new Collection();
    public buttons: Collection<string, Buttons> = new Collection();
    public slashCommands: Collection<string, SlashCommands> = new Collection();
    public cooldowns: Collection<string, Cooldowns> = new Collection();
    public selectMenus: Collection<string, SelectMenus> = new Collection();

    // Saved Cache
    public primaryColour: ColorResolvable = "#000000";

    // Music Module
    public queue: Collection<string, Queue> = new Collection();
    public activeCollector: Collection<string, boolean> = new Collection();

    public async init(): Promise<void> {
        await createConnection();
        await this.login(CONFIG.token).catch(console.error);


        const botRepo = getRepository(Bot);

        let [bot] = await botRepo.find();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (bot === undefined) {
            const newBot = new Bot();
            await botRepo.save(newBot);
            bot = newBot;
        }

        setInterval(async () => {
            [bot] = await botRepo.find();
            this.primaryColour = bot.primaryColour as ColorResolvable;

        }, 5000);

        this.primaryColour = bot.primaryColour as ColorResolvable;

        /* Commands */
        const commandPath = path.join(__dirname, "..", "commands");
        fs.readdirSync(commandPath).forEach(async (dir) => {
            const cmds = readdirSync(`${commandPath}/${dir}`).filter((file) => file.endsWith(".js"));

            for (const file of cmds) {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { command } = await import(`${commandPath}/${dir}/${file}`);
                this.commands.set(command.name, command);

                if (command?.aliases !== undefined) {
                    command.aliases.forEach((alias: string) => {
                        this.aliases.set(alias, command);
                    });
                }

            }
        });

        /* Events */
        const eventPath = path.join(__dirname, "..", "events");
        fs.readdirSync(eventPath).filter((file) => file.endsWith(".js")).forEach(async (file) => {
            const { event } = await import(`${eventPath}/${file}`);
            this.events.set(event.name, event);
            console.log(event);
            this.on(event.name, event.run.bind(null, this));
        });


        /* Buttons */
        const buttonsPath = path.join(__dirname, "..", "interactions", "buttons");
        fs.readdirSync(buttonsPath).forEach((dir) => {
            const buttonFiles = readdirSync(`${buttonsPath}/${dir}`).filter((file) => file.endsWith(".js"));

            for (const file of buttonFiles) {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { buttons } = require(`${buttonsPath}/${dir}/${file}`);
                this.buttons.set(buttons.name, buttons);

            }
        });

        /* Select Menus */
        const menuPath = path.join(__dirname, "..", "interactions", "selectMenus");
        fs.readdirSync(menuPath).forEach((dir) => {
            const menuFiles = readdirSync(`${menuPath}/${dir}`).filter((file) => file.endsWith(".js"));

            for (const file of menuFiles) {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { menu } = require(`${menuPath}/${dir}/${file}`);
                this.selectMenus.set(menu.name, menu);

            }
        });

        /* Slash Commands */
        const slashPath = path.join(__dirname, "..", "interactions", "slashCommands");
        fs.readdirSync(slashPath).forEach(async (dir) => {
            const slashCommmands = readdirSync(`${slashPath}/${dir}`).filter((file) => file.endsWith(".js"));

            for (const file of slashCommmands) {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { slashCommand } = require(`${slashPath}/${dir}/${file}`);
                this.slashCommands.set(slashCommand.name, slashCommand);


            }

        });


    }

    public async commandFailed(msg: Message | CommandInteraction, reason?: string): Promise<void | Message> {

        let response = "There was an error when executing the command";
        if (reason !== undefined) response = `There was an error when executing the command, Reason:\n${reason}`;

        if (msg instanceof Message) {
            return msg.reply({ content: response });

        }
        return msg.reply({ content: response, ephemeral: true });


    }

    public async reply(msg: Message | CommandInteraction, { content, ephemeral, embeds, components, files, options, mention }: ReplyEmbedArguments): Promise<void | Message> {

        if (msg instanceof Message) {
            if (ephemeral === true) console.log("Ephemeral messages can only be used with / commands");
            return msg.reply({
                allowedMentions: mention ?? false ? { repliedUser: false } : undefined,
                components,
                content: content ?? undefined,
                embeds: embeds ? Array.isArray(embeds) ? embeds : [embeds] : undefined,
                files,
                options

            });
        }

        return msg.reply({
            allowedMentions: mention ?? false ? { repliedUser: false } : undefined,
            components,
            content: content ?? undefined,
            embeds: embeds ? Array.isArray(embeds) ? embeds : [embeds] : undefined,
            ephemeral,
            files,
            options

        });

    }

    public async embedReply(msg: Message | CommandInteraction, { content, ephemeral, embed, components, files, options, mention }: EmbedReplyEmbedArguments): Promise<void | Message> {

        if (embed instanceof MessageEmbed)
            if (embed.color === null) embed.setColor(this.primaryColour);

        if (msg instanceof Message) {
            if (ephemeral === true) console.log("Ephemeral messages can only be used with / commands");

            return msg.reply({
                allowedMentions: mention ?? false ? { repliedUser: false } : undefined,
                components,
                content: content ?? undefined,
                embeds: embed instanceof MessageEmbed ? [embed] :
                    [{
                        "author": embed.author,
                        "color": embed.color ?? this.primaryColour,
                        "description": embed.description,
                        "fields": embed.fields,
                        "footer": embed.footer,
                        "image": embed.image,
                        "thumbnail": embed.thumbnail,
                        "timestamp": embed.timestamp,
                        "title": embed.title,
                        "url": embed.url,
                        "video": embed.video
                    }],
                files,
                options

            });
        }

        return msg.reply({
            allowedMentions: mention ?? false ? { repliedUser: false } : undefined,
            components,
            content: content ?? undefined,
            embeds: embed instanceof MessageEmbed ? [embed] :
                [{
                    "author": embed.author,
                    "color": embed.color ?? this.primaryColour,
                    "description": embed.description,
                    "fields": embed.fields,
                    "footer": embed.footer,
                    "image": embed.image,
                    "thumbnail": embed.thumbnail,
                    "timestamp": embed.timestamp,
                    "title": embed.title,
                    "url": embed.url,
                    "video": embed.video
                }], ephemeral,
            files,
            options

        });

    }

    /**
 * Used to create pages from an array
 * @param {Array} array The array to page
 * @param {number} pageSize How big are each of the pages?
 * @param {number} pageNumber Which Page number do you wish to be on?
 * @returns {Array} an array
 */
    public arrayPage<T>(array: T[], pageSize: number, pageNumber: number): T[] {
        return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    }

    public async wait(ms: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    public canModifyQueue = (member: GuildMember | null): boolean => {
        const connection = getVoiceConnection(member?.guild.id ?? "")?.joinConfig.channelId;
        return member?.voice.channelId === connection;
    };

}

export default ExtendedClient;


