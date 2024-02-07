import asyncio
import importlib
import logging

from aiogram.enums.parse_mode import ParseMode
from aiogram.utils.token import TokenValidationError
from aiogram import Dispatcher, Bot, Router
from dotenv import load_dotenv
from rich.logging import RichHandler
from os import getenv, listdir

from . import exceptions

load_dotenv()

logging.basicConfig(
        format='[bold cyan]%(name)s[/] %(message)s',
        level=getenv('LOG_LEVEL', 0),
        handlers=[RichHandler(markup=True)]
)

log = logging.getLogger(__name__)

dp = Dispatcher()


async def main() -> None:
    try:
        bot = Bot(str(getenv("TOKEN", "")), parse_mode=ParseMode.MARKDOWN_V2)
    except TokenValidationError:
        raise exceptions.ConfigError("Check TOKEN in .env file")
    router = Router()
    modules = listdir(getenv("MODULES_PATH", "modules"))
    ignored_modules = getenv("IGNORED_MODULES", "").split(",")
    log.info(ignored_modules)
    for module in modules:
        if module.endswith(".py") and module not in ignored_modules:
            router.include_router(importlib.import_module(getenv("MODULES_PATH", "modules") + "." + module.split('.')[0]).router)
            log.info(f"{module} loaded")
    dp.include_router(router)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
