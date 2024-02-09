import re

from aiogram import Router, types

router = Router()
meow_finder = re.compile(r'^([Мм]([яувкрЯъУКВРЪ]){1,}){1,}')

@router.message(lambda m: meow_finder.search(m.text))
async def meow(message: types.Message):
    await message.reply("мяу")

