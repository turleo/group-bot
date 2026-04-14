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
        await api.tg.editMessage({ message: answer, text: "😿" });
        return;
      default:
        await api.tg.editMessage({ message: answer, text: "🦻🤔🦻" });
        break;
    }
  }
}

export async function handleMessage(update: MessageContext, api: Api) {
  const answer = await update.replyText("🦻🐱🦻");
  if (update.media?.type !== "voice" && update.media?.type !== "video") {
    return;
  }
  const tempDir = await mkdtemp(join(tmpdir(), "groupbot-tts"));
  const filePath = join(tempDir, update.media.fileName ?? "unknown.ogg");
  await api.tg.downloadToFile(filePath, update.media);
  const remuxedFile = await convertFileToOpus(filePath);
  const stateIterator = recognizeSpeech(api, remuxedFile);
  await processStatus(api, answer, stateIterator);
  await rm(tempDir, { recursive: true });
}
