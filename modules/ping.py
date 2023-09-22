import logging
from os import uname

from aiogram import Dispatcher, Router, types
from aiogram.filters.command import Command

log = logging.getLogger(__name__)

router = Router()

@router.message(Command('ping'))
async def pong(message: types.Message) -> None:
    await message.answer(f"🏓 Pong\\!\n🏃‍♀️ Running `{uname()}`")
    log.debug(f"{message.from_user.full_name} pinged")

