# blåhaj
Discord leveling bot designed to be flexible as possible

# Features
- Simple text leveling using a custom algorithm (see notes below)
- Multiplier system
- Logging of admin commands
- Per user configuration (i.e. the user can define if they even want to partake in leveling)

# Config file
This is the main part of the bot. Each instance on each guild needs it own config file. Below is an example and it explains what each key in the JSON file does

```json
{
    "token": "XXXXXXXXX",
    "application_id": "XXXXXXXXX",
    "guild_id": "XXXXXXXXX",
    "log_channel_id": "XXXXXXXXX",
    "database_path": "./data/levels.db",
    "textXP": {
        "minGain": 10,
        "maxGain": 40,
        "cooldown": 120
    },
    "multipliers": {
        "XXXXXXXXX": 1.5
    }
}
```
- `token`: The token for the Discord Bot
- `application_id`: The Application ID of the application (NOT OF THE BOT), needed to register slash commands
- `guild_id`: The ID of the guild (server) the bot is operating in, needed to register the slash commands
- `log_channel_id`: Channel ID of where to send logs of the Admin commands (i.e. /setxp) (recommended to be Administrator only!)
- `database_path`: Where to create the SQLite3 database (note that the parent directories already have to be created)
- `textXP`: Config for text expirience gain
    - `minGain`: Minimum gain for each message in XP points
    - `maxGain`: Maximum gain for each message in XP points
    - `cooldown`: A cooldown in seconds for when the next second should be evaluated
- `multipliers`: An object of a pair of role IDs and a multiplication value (like 1.5) for more information see below

# Per user config
TODO, WIP, whatever you want to call it

# Multipliers
This bot has the ability to give certain roles in the server different XP multipliers, so for example the Supporter role can get a 1.5 times multiplier because they are showing support. You can edit this in JSON but I recommend to use the `/setmp`, `/removemp` commands to set and remove multipliers. These multipliers can be viewed by everyone with the `/viewmp` command. These commands automatically write to the JSON configuration file

# Algorithm
This section talks about the leveling algorithm. The basic idea is that for each message you can get a random about of XP (specified by `textXP.minGain` and `textXP.maxGain`). Each message can get a value. This value will then be added to the users total XP. Now the cooldown specifies how long it takes for the next message to be rewarded. So for example if the cooldown is 120 seconds (2 minutes), when you send message it counts down from 120 seconds and while that countdown is not 0, you will not get rewarded for each message. As soon as the cooldown reaches 0, the next message you send will get rewarded again and the countdown will be restarted.

# How to run the bot
First create a config, I recommend to use the example one as a base. Then you can run `node src/index.js --config path/to/config.json` and the bot should be up and running! You can verify by running the `/ping` command in your server!

## Migrating XP
The whole point of writing this bot is to replace another XP bot (ProBot). This means you get a nice feature to migrate XP from your other bot. You can define `--migrate-xp path/to/xp/file.json`. The XP file contains each user ID of a user and thier XP value, so like
```json
{
    "XXXXX": 12417,
    "YYYYY": 6344,
    ...
}
```
Blåhaj will migrate the XP from this file into the database file