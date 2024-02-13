from aiogram import Bot, Dispatcher
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application
from aiohttp import web

from os import getenv

WEBHOOK_BASE_URL = getenv("WEBHOOK_BASE_URL")
WEBHOOK_PATH = getenv("WEBHOOK_PATH", "/")
WEBHOOK_SECRET = getenv("WEBHOOK_SECRET")
WEBHOOK_HOST = getenv("WEBHOOK_HOST", "127.0.0.1")
WEBHOOK_PORT = int(getenv("WEBHOOK_PORT", 9876))


async def on_startup(bot: Bot):
    await bot.set_webhook(f"{WEBHOOK_BASE_URL}{WEBHOOK_PATH}", secret_token=WEBHOOK_SECRET)


async def on_shutdown(bot: Bot):
    await bot.delete_webhook()


def start_bot(dp: Dispatcher, bot: Bot):
    app = web.Application()
    webhook_requests_handler = SimpleRequestHandler(
        dispatcher=dp,
        bot=bot,
        secret_token=WEBHOOK_SECRET,
    )
    webhook_requests_handler.register(app, path=WEBHOOK_PATH)
    dp.startup.register(on_startup)

    setup_application(app, dp, bot=bot)

    web.run_app(app, host=WEBHOOK_HOST, port=WEBHOOK_PORT)


