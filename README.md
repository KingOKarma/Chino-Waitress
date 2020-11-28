# discordjs-template

## How to use

```
$ git clone https://github.com/KingOKarma/discordjs-template
$ npm init
Go through accordingly (if you dont know what  to put just press enter)
$ npm install discord.js
```
- Once the terminal cmds have been ran make sure to add your token and prefix into `src/config.json`
- Take a read through the comments to understand how it works

Once you're all set just run
```
$ cd src
to make sure you're in your src folder
then
$ node .
to run index.js
```

### If you are running on a server/VPS
- you can use pm2
```
enter your src folder
$ pm2 start index.js --name <what-ever-you-want>
to check logs you can do 
$ pm2 logs <name>
```

### Extra info
- This same template was used to start off [KFC Bucket Boy](https://github.com/KingOKarma/KFCBoy)

- If you want to add new commands, follow the template used in `src/commands/fun/kek.js`

- You can sort your modules by making different folders in `src/commands`

- From here you can expand your bot

- When making asynchronous cmds you can follow the template in `src/commands/testing/ping.js`


### Enjoy
- Make sure to also check out https://bucketbot.dev


