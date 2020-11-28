module.exports = {
    name: 'kek', //You can name the cmd here
    run: (_, message) => { //this will run your message
        message.channel.send(`KEK`) //this is your command
        console.log("someone was a gamer"); //this will log when the cmd is ran
    }

}
