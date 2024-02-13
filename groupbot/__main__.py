import importlib

from aiogram.enums.parse_mode import ParseMode
from aiogram.utils.token import TokenValidationError
from aiogram import Dispatcher, Bot, Router
from dotenv import load_dotenv
from os import getenv, listdir
from .logging import Logging

from . import exceptions

load_dotenv()


logging = Logging()
log = logging.log.getLogger(__name__)


def main() -> None:
    try:
        bot = Bot(str(getenv("TOKEN", "")), parse_mode=ParseMode.MARKDOWN_V2)
    except TokenValidationError:
        raise exceptions.ConfigError("Check TOKEN in .env file")
    router = Router()
    modules = listdir(getenv("MODULES_PATH", "modules"))
    ignored_modules = getenv("IGNORED_MODULES", "").split(",")
    log.info("ignoring modules: " + ', '.join(ignored_modules))
    for module in modules:
        if module.endswith(".py") and module not in ignored_modules:
            router.include_router(importlib.import_module(getenv("MODULES_PATH", "modules") + "." + module.split('.')[0]).router)
            log.info(f"{module} loaded")
    
    logging.bot_started(bot)

    dp = Dispatcher()
    dp.include_router(router)


    if getenv("USE_WEBHOOKS"):
        from .webhook import start_bot
    else:
        from .polling import start_bot
    start_bot(dp, bot)


if __name__ == "__main__":
    main()
