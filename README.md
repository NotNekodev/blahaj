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
    "log_file": "blahaj.log",
    "database_path": "./data/levels.db",
    "textXP": {
        "minGain": 10,
        "maxGain": 40,
        "cooldown": 120
    },
    "multipliers": {
        "XXXXXXXXX": 1.5
    }
    ,
    "levelup_notification_channel_id": "XXXXXXXXX"
}
```
- `token`: The token for the Discord Bot
- `application_id`: The Application ID of the application (NOT OF THE BOT), needed to register slash commands
- `guild_id`: The ID of the guild (server) the bot is operating in, needed to register the slash commands
- `log_channel_id`: Channel ID of where to send logs of the Admin commands (i.e. /setxp) (recommended to be Administrator only!)
- `log_file`: The file where to store more verbose logs. If not specified the file `blahaj.log` will be used as seen in the example config
- `database_path`: Where to create the SQLite3 database (note that the parent directories already have to be created)
- `textXP`: Config for text expirience gain
    - `minGain`: Minimum gain for each message in XP points
    - `maxGain`: Maximum gain for each message in XP points
    - `cooldown`: A cooldown in seconds for when the next second should be evaluated
- `multipliers`: An object of a pair of role IDs and a multiplication value (like 1.5) for more information see below

- `levelup_notification_channel_id`: Optional channel ID where level-up pings (mentions) will be sent. If not set or invalid the bot falls back to the channel where the user sent the message.

# Per user config
Each user can opt in/out of the leveling system and control whether they want to be pinged on level-up.

- `participate`: when `true` the user will receive XP from text/voice activity. When `false` they are ignored by the leveling system.
- `pinged`: when `true` the bot will @mention the user when they level up (if a level-up notification channel is configured).

Users can view/update these settings with the `/userconf` and `/viewuserconf` commands.

# Multipliers
This bot has the ability to give certain roles in the server different XP multipliers, so for example the Supporter role can get a 1.5 times multiplier because they are showing support. You can edit this in JSON but I recommend to use the `/setmp`, `/removemp` commands to set and remove multipliers. These multipliers can be viewed by everyone with the `/viewmp` command. These commands automatically write to the JSON configuration file

# Algorithm
This section talks about the leveling algorithm. The basic idea is that for each message you can get a random about of XP (specified by `textXP.minGain` and `textXP.maxGain`). Each message can get a value. This value will then be added to the users total XP. Now the cooldown specifies how long it takes for the next message to be rewarded. So for example if the cooldown is 120 seconds (2 minutes), when you send message it counts down from 120 seconds and while that countdown is not 0, you will not get rewarded for each message. As soon as the cooldown reaches 0, the next message you send will get rewarded again and the countdown will be restarted.

Level formula
- The bot computes a user's level from their total XP (textxp + voicexp) using the formula:

    level = floor(0.1 * sqrt(totalXP))

- Solving for totalXP gives the threshold for level L as totalXP >= 100 * L^2. Examples:
    - Level 1: totalXP >= 100 (users with no DB row default to level 1)
    - Level 2: totalXP >= 400
    - Level 3: totalXP >= 900
    - Level 4: totalXP >= 1600

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

# Commands
Below are the slash commands the bot exposes and their purpose (may vary by version):

- `addxp`: Admin helper to add XP to a user (shorthand for manual adjustments).
- `setxp`: Admin command to set a user's XP to a specific value.
- `subxp`: Admin helper to subtract XP from a user.
- `setmp`: Set a role XP multiplier in the config (e.g., give a role 1.5x XP).
- `removemp`: Remove a role multiplier previously set via `setmp`.
- `viewmp`: View configured role multipliers.
- `top`: Show the leaderboard / top users by total XP.
- `userconf`: Open a menu for the calling user to change their `participate` and `pinged` preferences.
- `viewuserconf`: View another user's per-user preferences (requires Administrator to view others).
- `ping`: Diagnostic command to check bot responsiveness.

If you add/remove commands in code, re-register them by restarting the bot (the bot registers guild commands on startup).