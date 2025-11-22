/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { Message } from "@mtcute/bun";
import { filters, MessageContext } from "@mtcute/dispatcher";

import type { Api } from "~/src/api/types";

const FETCH_TIMEOUT = 500;

async function sendAnswer(api: Api, answer: Message, result: string) {
  const text: [number, string][] = [];
  const parts = result.split("\n");
  for (const part of parts) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const data: any = JSON.parse(part);
      text.push([
        Number.parseInt(data.result.finalRefinement.finalIndex as string, 10),
        data.result.finalRefinement.normalizedText.alternatives[0]
          .text as string,
      ]);
    }
    catch {
      // Handled service event
    }
  }
  text.sort(([first], [second]) => first - second);
  const joinedText = text.map(([_index, line]) => line).join("\n");
  const answerText = {
    entities: [
      {
        // eslint-disable-next-line id-length
        _: "messageEntityBlockquote" as const,
        collapsed: true,
        length: joinedText.length,
        offset: 0,
      },
    ],
    text: joinedText,
  };

  await api.tg.editMessage({
    message: answer,
    text: answerText,
  });
}

async function recursivelyFetchRecognition(
  api: Api,
  recognitionId: string,
  apiKey: string,
): Promise<string> {
  const recognitionResult = await fetch(
    `https://stt.api.cloud.yandex.net:443/stt/v3/getRecognition?operation_id=${recognitionId}`,
    {
      headers: {
        Authorization: apiKey,
      },
    },
  );
  if (!recognitionResult.ok) {
    api.log.info(
      `Return code is ${recognitionResult.status.toString()}`,
    );
    await new Promise((resolve) => {
      setTimeout(resolve, FETCH_TIMEOUT);
    });
    return await recursivelyFetchRecognition(api, recognitionId, apiKey);
  }

  return await recognitionResult.text();
}

async function recognizeSpeech(api: Api, answer: Message, file: Uint8Array) {
  const apiKey = api.config.YA_CLOUD_AUTH;
  if (typeof api.config.YA_CLOUD_AUTH !== "string") {
    throw new TypeError(`YA_CLOUD_AUTH is not string but ${typeof apiKey}`);
  }
  const beginRecognition = await fetch(
    "https://stt.api.cloud.yandex.net/stt/v3/recognizeFileAsync",
    {
      body: JSON.stringify({
        content: file.toBase64(),
        recognitionModel: {
          audioFormat: {
            containerAudio: {
              containerAudioType: "OGG_OPUS",
            },
          },
          model: "general",
          textNormalization: {
            textNormalization: "TEXT_NORMALIZATION_ENABLED",
          },
        },
      }),
      headers: {
        Authorization: apiKey as string,
      },
      method: "POST",
    },
  );
  if (!beginRecognition.ok) {
    throw new TypeError(
      `Return code is ${beginRecognition.status.toString()}: ${await beginRecognition.text()}`,
    );
  }
  const recognition = (await beginRecognition.json()) as { id: string };

  await api.tg.editMessage({
    message: answer,
    text: "🦻🤔🦻",
  });

  const results = await recursivelyFetchRecognition(api, recognition.id, apiKey as string);
  await sendAnswer(api, answer, results);
}

// Const checker = filters.or(filters.voice, filters.roundMessage); // TODO: converting video to audio
const checker = filters.voice;

async function handler(update: MessageContext, api: Api) {
  const answer = await update.replyText("🦻🐱🦻");
  let file = new Uint8Array() as Uint8Array;
  if (update.media?.type === "voice") {
    file = await api.tg.downloadAsBuffer(update.media);
  }
  else if (update.media?.type === "video") {
    // TODO
  }
  await recognizeSpeech(api, answer, file);
}

export default {
  checker,
  eventName: "new_message",
  handler,
};
