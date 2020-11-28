const Discord = require('discord.js'); //gets the discord.js library
const bot = new Discord.Client(); //creats a const for the discord client
const config = require('../config.json'); //allows this file to reach your config file

module.exports = {
    name: "ready",
    run: async (bot) => {


        const setCollections = require('../utils/collections'); //grabs the collection
        setCollections(bot);
        const commandHandler = require('../handlers/command'); //grabs the handler
        commandHandler(bot);
    
    
        console.log('Im Online now bois');
    
        console.log(`Bot has started, with ${bot.users.cache.size} users, in ${bot.channels.cache.size} channels of ${bot.guilds.cache.size} guilds.`);
    
        bot.user.setActivity(`I'm still a work in progress owo!`); //sets status
    






    }
}
