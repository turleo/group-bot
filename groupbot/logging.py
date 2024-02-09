import logging
import asyncio
from typing import Iterable

from aiogram import Bot
from rich.logging import RichHandler
from os import getenv
from .utils.demarkdown import demarkdown


level_emoji = {
        logging.NOTSET: "🤓",
        logging.DEBUG: "🐛",
        logging.INFO: "ℹ️",
        logging.WARNING: "⚠️",
        logging.ERROR: "❌",
        logging.CRITICAL: "🪦"
}


class ErrorReporterHandler(logging.Handler):
    bot: None | Bot = None

    def __init__(self, admins: Iterable[int], min_report: int):
        self.admins = admins
        self.min_report = min_report
        self.event_loop = asyncio.get_event_loop()
        super().__init__(level=min_report)

    def emit(self, record: logging.LogRecord):
        if not self.bot:
            return
        print(self.min_report)
        for admin in self.admins:
            asyncio.create_task(
                self.bot.send_message(admin, self.recordToString(record))
            )

    def close(self):
        self.event_loop.close()


    @staticmethod
    def recordToString(record: logging.LogRecord):
        return f"""
{level_emoji[record.levelno]} **{record.levelname}**
👉 {record.module} \(`{demarkdown(record.filename)}:{record.lineno}`\)
✍️ {demarkdown(record.message)}
    """


class Logging:
    def __init__(self):
        report_to = [int(i) for i in getenv("ADMINS", "").split()]
        min_report_str = getenv("MIN_REPORT", "WARNING")
        min_report = logging.getLevelNamesMapping()[min_report_str]
        print(min_report_str, min_report)
        self.errorReporterHandler = ErrorReporterHandler(report_to, min_report)

        logging.basicConfig(
                format="[bold cyan]%(name)s[/] %(message)s",
                level=getenv("LOG_LEVEL", 0),
                handlers=[RichHandler(markup=True), self.errorReporterHandler]
        )
        
        self.log = logging
    
    def bot_started(self, bot: Bot):
        self.log.getLogger("aiogram").setLevel(logging.WARNING)
        self.errorReporterHandler.bot = bot

