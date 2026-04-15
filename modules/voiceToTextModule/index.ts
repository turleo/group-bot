import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { Message } from "@mtcute/bun";
import { MessageContext } from "@mtcute/dispatcher";

import type { Api } from "~/src/api/types";

import { recognizeSpeech } from "./engines/yandex";
import { convertFileToOpus } from "./ffmpeg";
import type { Recognition } from "./types/recognition";
import { RecognitionStatus } from "./types/recognitionStatus";

async function sendAnswer(api: Api, answer: Message, result: string) {
  if (!result.trim()) {
    await api.tg.deleteMessages([answer]);
    return;
  }
  const answerText = {
    entities: [
      {
        // eslint-disable-next-line id-length
        _: "messageEntityBlockquote" as const,
        collapsed: true,
        length: result.length,
        offset: 0,
      },
    ],
    text: result,
  };

  await api.tg.editMessage({
    message: answer,
    text: answerText,
  });
}

async function processStatus(api: Api, answer: Message, stateIterator: AsyncIterable<Recognition>) {
  for await (const state of stateIterator) {
    switch (state.status) {
      case RecognitionStatus.Done:
        await sendAnswer(api, answer, state.text ?? "😿");
        return;
      case RecognitionStatus.Failed:
        throw new Error("Recognition failed");
      default:
        await api.tg.editMessage({ message: answer, text: "🦻🤔🦻" });
        break;
    }
  }
}

async function processMedia(api: Api, answer: Message, update: MessageContext) {
  if (update.media?.type !== "voice" && update.media?.type !== "video") {
    throw new Error("Unsupported media type");
  }
  const tempDir = await mkdtemp(join(tmpdir(), "groupbot-tts"));
  const filePath = join(tempDir, update.media.fileName ?? "unknown.ogg");
  await api.tg.downloadToFile(filePath, update.media);
  const remuxedFile = await convertFileToOpus(filePath);
  const stateIterator = recognizeSpeech(api, remuxedFile);
  await processStatus(api, answer, stateIterator);
  await rm(tempDir, { recursive: true });
}

export async function handleMessage(update: MessageContext, api: Api) {
  const answer = await update.replyText("🦻🐱🦻");
  try {
    await processMedia(api, answer, update);
  }
  catch (error) {
    if (error instanceof Error) {
      api.log.error(error.message);
    }
    else {
      api.log.error(String(error));
    }

    await api.tg.deleteMessages([answer]);
    await api.tg.sendReaction({
      emoji: "😢",
      message: update.messages[0],
    });
  }
}
