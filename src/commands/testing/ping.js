module.exports = {
    name: 'ping',//You can name the cmd here
    alias: ["pong", "pang"], //You can make an alias for the bot here
    run: async (_, message, prefix) => { //this will run your message
        const responseTime = Math.round(Date.now() - message.createdTimestamp); // This will round the response time between when the message was received and when the message was sent
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        message.delete(); //de;etes the {prefix}ping
        const pingf = await message.channel.send(`🏓 Pinging....`); //creates a const for ping
        pingf.edit(`**Ping**🏓\n**Response time is:** ${responseTime}ms`); //responds with the ping in ms
    }
}