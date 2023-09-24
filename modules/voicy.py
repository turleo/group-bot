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
from os import getenv, listdir
from tempfile import TemporaryDirectory
from subprocess import Popen, PIPE

router = Router()
log = logging.getLogger(__name__)
headers = {
        "Authorization": "Bearer " + getenv("WITAI_TOKEN", ""),
        "Content-Type": "audio/wav",
        "Connection": "close"
    }
session = aiohttp.ClientSession(headers=headers)

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
    telegram_file_to_wav(file_path, directory.name)
    log.debug(file_path)
    transcribed_text = ""
    for i in listdir(directory.name):
        if not i.endswith(".wav"):
            continue
        log.debug(f"Transcriing {i}")
        transcribed_text += await file_transcriber(f"{directory.name}/{i}")
            
    return transcribed_text


async def file_transcriber(file: str) -> str:
    with open(file, 'rb') as f:
        async with session.post(
                "https://api.wit.ai/speech",
                headers=headers,
                data=f.read()
                ) as resp:
            chunks = [chunk[0] async for chunk in resp.content.iter_chunks()]
            try:
                out = json.loads(chunks[-1].decode())
                return out["text"]
            except Exception:
                log.error(chunks[-1].decode())
                return "...😢..."


def telegram_file_to_wav(file_path: str, dir_path: str) -> None:
    process = Popen([
        "ffmpeg", "-i",file_path, 
        "-segment_time", "00:00:10", "-f", "segment",
        f"{dir_path}/%03d.wav"], stdout=PIPE, stderr=PIPE)
    out, err = process.communicate()
    log.debug(err)

