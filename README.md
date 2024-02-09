# Bot for groups 🫂

It's just a bot for my own purposes in my telegram's channel discussion group.

## Configuration
This bot is being configured through `.env` file or environment variables.

Here is list of bot's basic configuration:

### `TOKEN`
Telegram bot token from [BotFather](https://t.me/BotFather).
**Required**

### `MODULES_PATH`
Path to directory with modules.
_Default is `$(cwd)/modules`_

### `IGNORED_MODULES`
Comma separated list of `.py` files in modules directory, that should not be loaded as modules.
_Default is empty_

### `ADMINS`
Comma-separated Telegram IDs of priveleged users.
_Default is empty_

### `MIN_REPORT`
Minimum [log level](https://docs.python.org/3/library/logging.html#levels) for logs, that will be reported to admins. 
_Default is `WARNING`_


## Modules 
Information about modules and their configuration is available at [modules/readme.md](modules/readme.md)
