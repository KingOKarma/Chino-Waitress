const Discord = require('discord.js'); //gets the discord.js library
const bot = new Discord.Client(); //creats a const for the discord client
const config = require('../config.json'); //allows this file to reach your config file

module.exports = {
    name: "message",
    run: async (bot, message) => {


        if (!message.channel.type == "dm") return; //checks if channel is a dm
        if (message.author.bot) return; //checks if author is a bot

        const prefix = config.prefix //creates a var for the prefix

        if (!message.content.toLowerCase().startsWith(prefix)) return; //makes sure the bot only responds to cmds with its prefix
        const args = message.content.toLowerCase().slice(prefix.length).trim().split(/ +/g); //creats the args var
        const commandname = args.shift().toLowerCase(); //cmd name

        const command = bot.commands.get(commandname) || bot.commands.get(bot.aliases.get(commandname));
        if (!command) return;
        try {
            command.run(bot, message, args, prefix); //runs the cmd from the folders provided
        } catch (error) {
            console.error(error);
        }












    }
}