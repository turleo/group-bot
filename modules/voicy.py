"""
Module to transcribe voice and video messages
Inspired by https://github.com/backmeupplz/voicy
"""
import aiohttp
import json
import json.decoder
import logging
from aiogram import Bot, Router
from aiogram.types import Message
from os import getenv
from tempfile import TemporaryDirectory
from subprocess import Popen, PIPE

router = Router()
log = logging.getLogger(__name__)
log.setLevel(logging.ERROR)


@router.message(lambda m: m.voice)
async def voice_message_handler(message: Message) -> None:
    text = await file_decoder(message.voice.file_id, message.voice.mime_type, message.bot)
    if not text:
        return
    await message.answer(text, reply_to_message_id=message.message_id)


@router.message(lambda m: m.video_note)
async def video_message_handler(message: Message) -> None:
    import code
    # code.interact(local=locals())
    text = await file_decoder(message.video_note.file_id, "video/mp4", message.bot)
    if not text:
        return
    await message.answer(text, reply_to_message_id=message.message_id)



async def file_decoder(file_id: str | None, mime: str | None, bot: Bot) -> str:
    directory = TemporaryDirectory()
    file_path = directory.name + f"/{file_id}.{mime.split('/')[1]}"
    await bot.download(file=file_id, destination=file_path)
    wav = telegram_file_to_wav(file_path)
    log.debug(file_path)
    with open('out', 'wb+') as f:
        f.write(wav)
    headers = {
        "Authorization": "Bearer " + getenv("WITAI_TOKEN", ""),
        "Content-Type": "audio/wav",
        "Connection": "close"
    }
    async with aiohttp.ClientSession(headers=headers) as session:
        async with session.post(
                "https://api.wit.ai/speech",
                headers=headers,
                data=wav
                ) as resp:
            chunks = [chunk[0] async for chunk in resp.content.iter_chunks()]
            try:
                out = json.loads(chunks[-1].decode())
            except Exception:
                log.error(chunks[-1].decode())
                return ""
            log.info(out)
            return out["text"]


def telegram_file_to_wav(path: str) -> bytes:
    process = Popen(["ffmpeg", "-i",path, "-f", "wav", "-"], stdout=PIPE, stderr=PIPE)
    out, err = process.communicate()
    log.debug(err)
    return out

