from aiogram import Bot, Dispatcher
import asyncio

def start_bot(dp: Dispatcher, bot: Bot):
    asyncio.run(dp.start_polling(bot))

