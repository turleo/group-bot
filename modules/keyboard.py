import logging
from os import uname

from aiogram import Dispatcher, Router, types
from aiogram.filters.command import Command

from groupbot.utils import demarkdown

log = logging.getLogger(__name__)

router = Router()

translate_dictionary = str.maketrans({"ё": "`", "Ё": "~", "!": "!", "\"": "Э", "№": "#", ";": "ж", ":": "Ж", "?": ",", "й": "q", "ц": "w", "у": "e", "к": "r", "е": "t", "н": "y", "г": "u", "ш": "i", "щ": "o", "з": "p", "х": "[", "ъ": "]", "\\": "\\", "Й": "Q", "Ц": "W", "У": "E", "К": "R", "Е": "T", "Н": "Y", "Г": "U", "Ш": "I", "Щ": "O", "З": "P", "Х": "{", "Ъ": "}", "/": ".", "ф": "a", "ы": "s", "в": "d", "а": "f", "п": "g", "р": "h", "о": "j", "л": "k", "д": "l", "ж": ";", "э": "\"", "Ф": "A", "Ы": "S", "В": "D", "А": "F", "П": "G", "Р": "H", "О": "J", "Л": "K", "Д": "L", "Ж": ":", "Э": "\"", "я": "z", "ч": "x", "с": "c", "м": "v", "и": "b", "т": "n", "ь": "m", "б": ",", "ю": ".", ".": "ю", "Я": "Z", "Ч": "X", "С": "C", "М": "V", "И": "B", "Т": "N", "Ь": "M", "Б": "<", "Ю": ">", ",": "б", "`": "ё", "~": "Ё", "@": "\"", "#": "№", "$": ";", "^": ":", "&": "?", "q": "й", "w": "ц", "e": "у", "r": "к", "t": "е", "y": "н", "u": "г", "i": "ш", "o": "щ", "p": "з", "[": "х", "]": "ъ", "Q": "Й", "W": "Ц", "E": "У", "R": "К", "T": "Е", "Y": "Н", "U": "Г", "I": "Ш", "O": "Щ", "P": "З", "{": "Х", "}": "Ъ", "|": "/", "a": "ф", "s": "ы", "d": "в", "f": "а", "g": "п", "h": "р", "j": "о", "k": "л", "l": "д", "\'": "э", "A": "Ф", "S": "Ы", "D": "В", "F": "А", "G": "П", "H": "Р", "J": "О", "K": "Л", "L": "Д", "z": "я", "x": "ч", "c": "с", "v": "м", "b": "и", "n": "т", "m": "ь", "Z": "Я", "X": "Ч", "C": "С", "V": "М", "B": "И", "N": "Т", "M": "Ь", "<": "Б", ">": "Ю"})

vowels = "aeiouаяуюоеёэиы"
consonant = "bcdfgjklmnpqstvxzhrwyбвгджзйклмнпрстфхцчшщ"


@router.message(Command("xkb"))
async def keyboard_switcher(message: types.Message) -> None:
    await message.reply(
            switch_keyboard(str(message.reply_to_message.text)),
            reply_to_message_id=message.message_id
    )


@router.message(lambda m: m.text and not m.text.startswith('/'))
async def wrong_keyboard_detect(message: types.Message) -> None:
    vowels_count = 0
    consonant_count = 0
    for i in str(message.text):
        if i in vowels: vowels_count += 1
        elif i in consonant: consonant_count += 1
    total_letters = vowels_count + consonant_count
    if not total_letters:
        return
    # transliterate if vowels and consonant ratio is strange
    if vowels_count / total_letters < 0.35 or consonant_count / total_letters < 0.35:
        await message.reply(
                switch_keyboard(str(message.text)),
                reply_to_message_id=message.message_id
        )




def switch_keyboard(s: str) -> str:
    return demarkdown.demarkdown(
                s.translate(translate_dictionary)
            )

