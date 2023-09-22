"""
Module to transcribe voice and video messages
Inspired by https://github.com/backmeupplz/voicy
"""
import aiohttp
import json
import io
from aiogram import Router
from aiogram.types import Message
from os import getenv
from subprocess import Popen, PIPE, DEVNULL

router = Router()


@router.message(lambda m: m.voice)
async def voice_message_handler(message: Message) -> None:
    file = io.BytesIO()
    await message.bot.download(file=message.voice.file_id, destination=file)
    text = await file_decoder(file)
    if not text:
        return
    await message.answer(text, reply_to_message_id=message.message_id)


async def file_decoder(file: io.BytesIO) -> str:
    wav = telegram_file_to_wav(file)
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
            except json.decoder.JSONDecoderError:
                log.debug(chunks[-1].decode())
            return out["text"]


def telegram_file_to_wav(voice: io.BytesIO) -> bytes:
    process = Popen(["ffmpeg", "-i","-", "-f", "wav", "-"], stdin=PIPE, stdout=PIPE, stderr=DEVNULL)
    out, err = process.communicate(voice.read())
    return out

