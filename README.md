# 🚕 Group bot

Brand new version of the bot, rewritten from scratch on TypeScript, using [@mtcute/mtcute](https://github.com/mtcute/mtcute) and [bun](https://bun.sh)
In early develpment

## ⚙️ Configuration

Configuration is stored in environment variables or in `.env` file. Avaliable variables are

- `API_ID` and `API_HASH` - mtcute uses [mtproto](https://core.telegram.org/mtproto) and you need to get this variables from https://my.telegram.org/apps
- `BOT_TOKEN` - bot token from [@BotFather](https://t.me/botfather)
- `MODULES_PATH` - path to the modules folder. Default is `./modules`


## 🏃 Running 

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run run
```

No docker yet((

