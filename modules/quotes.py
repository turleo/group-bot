import logging

from aiogram import Router, types
from aiogram.filters.command import Command
from html2image import Html2Image
from jinja2 import Environment, FileSystemLoader
from tempfile import TemporaryDirectory

log = logging.getLogger(__name__)

router = Router()
environment = Environment(loader=FileSystemLoader("modules/quotes/"))
template = environment.get_template("quote.html")


@router.message(Command('q'))
async def create_quote(message: types.Message) -> None:
    directory = TemporaryDirectory()
    hti = Html2Image(output_path=directory.name, size=(700, 700))
    photos = await message.bot.get_user_profile_photos(message.reply_to_message.from_user.id)
    if not photos.photos:
        pass
    else:
        photo = await message.bot.get_file(photos.photos[0][0].file_id)
        await message.bot.download_file(photo.file_path, directory.name + f"/{message.reply_to_message.from_user.id}.png")
    context = {
            "messages": [
            {
                "username": f"{message.reply_to_message.from_user.first_name or ''} {message.reply_to_message.from_user.last_name or ''}",
                "author_color": "white",
                "text": message.reply_to_message.text,
                "avatar": directory.name + f"/{message.reply_to_message.from_user.id}.png"
            }
        ]
            
    }
    quote = template.render(context)
    with open(directory.name + "/out.html", "w+") as f:
        f.write(quote)

    log.debug(directory.name)
    hti.screenshot(url=f"file://{directory.name}/out.html", save_as="out.png")
    with open("out.png", "rb") as f:
        file = types.FSInputFile(directory.name + "/out.png")
        await message.reply_photo(file)

