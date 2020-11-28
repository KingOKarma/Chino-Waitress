const Discord = require('discord.js'); //gets the discord.js library
const bot = new Discord.Client(); //creats a const for the discord client
const config = require('./config.json'); //allows this file to reach your config file




let token = config.token //creates a var for your token




const fs = require('fs'); // fs is the package we need to read all files which are in folders
// const ignoreCat = require("./models/ignoreCat")


// event handler
fs.readdir('./events/', (err, events) => {
    bot.events = new Map()
    for (let file of events) {
        if(!file.endsWith(".js")) return;
        let pull = require(`./events/${file}`);
        if (pull.name) {
            bot.events.set(pull.name, pull);
            bot.on(pull.name, pull.run.bind(require(`./events/${file}`), bot))
        } else {
            continue;
        }
    }
})


bot.login(token).catch(console.error) //logs in

