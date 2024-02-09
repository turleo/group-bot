import logging
import subprocess
from os import uname

from aiogram import Router, types
from aiogram.filters.command import Command

log = logging.getLogger(__name__)

router = Router()

@router.message(Command('ping'))
async def pong(message: types.Message) -> None:
    version_bytes = subprocess.run(["git", "log", "-1", "--pretty=format:`%h` %s"],
                             stdout=subprocess.PIPE).stdout
    version = version_bytes.decode("utf8")
    await message.reply(f"🏓 Pong\\!\n🏃‍♀️ Running `{uname()}`\n📜 Commit {version}")
    log.debug(f"{message.from_user.full_name} pinged")

