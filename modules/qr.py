import logging
import zbarlight
from aiogram import Bot, Router
from aiogram.types import Message
from aiogram.enums.parse_mode import ParseMode
from io import BytesIO
from PIL import Image

router = Router()
log = logging.getLogger(__name__)

demarkdowned_table = str.maketrans({i: f"\\{i}" for i in ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!']})

@router.message(lambda m: m.photo)
async def decode_qr(message: Message) -> None:
    image_file = BytesIO()
    await message.bot.download(message.photo[-1].file_id, image_file)
    img = Image.open(image_file)
    qr = zbarlight.scan_codes("qrcode", img)
    if not qr:
        return
    out = "👀 QR codes:\n"
    for i, text in enumerate(qr):
        out += f"{i + 1}. {text.decode('utf8')}"
    demarkdowned = out.translate(demarkdowned_table)
    await message.reply(demarkdowned, reply_to_message_id=message.message_id)

