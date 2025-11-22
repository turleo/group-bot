import { html } from "@mtcute/html-parser";
import { filters, MessageContext } from "@mtcute/dispatcher";
import type { Api } from "~/src/api/types";
import type { Message } from "@mtcute/bun";

// const checker = filters.or(filters.voice, filters.roundMessage); // TODO: converting video to audio
const checker = filters.voice;

async function handler(update: MessageContext, api: Api) {
  const answer = await update.replyText("🦻🐱🦻");
  let file: Uint8Array<ArrayBufferLike> = new Uint8Array();
  if (update.media?.type === "voice") {
    file = await api.tg.downloadAsBuffer(update.media);
  } else if (update.media?.type === "video") {
    // TODO
  }
  recognizeSpeech(api, answer, file);
}

async function recognizeSpeech(api: Api, answer: Message, file: Uint8Array) {
  const apiKey = api.config["YA_CLOUD_AUTH"];
  if (typeof api.config["YA_CLOUD_AUTH"] !== "string") {
    throw TypeError(`YA_CLOUD_AUTH is not string but ${typeof apiKey}`);
  }
  const beginRecognition = await fetch(
    "https://stt.api.cloud.yandex.net/stt/v3/recognizeFileAsync",
    {
      method: "POST",
      body: JSON.stringify({
        content: file.toBase64(),
        recognition_model: {
          model: "general",
          audioFormat: {
            containerAudio: {
              containerAudioType: "OGG_OPUS",
            },
          },
          textNormalization: {
            textNormalization: "TEXT_NORMALIZATION_ENABLED",
          },
        },
      }),
      headers: {
        Authorization: apiKey as string,
      },
    }
  );
  if (!beginRecognition.ok) {
    throw TypeError(
      `Return code is ${
        beginRecognition.status
      }: ${await beginRecognition.text()}`
    );
  }
  const recognition = await beginRecognition.json();
  const url = new URL("https://operation.api.cloud.yandex.net/operations");
  url.searchParams.set("operationId", recognition.id);

  function recursivelyFetchRecognition() {
    setTimeout(async () => {
      const recognitionResult = await fetch(
        `https://stt.api.cloud.yandex.net:443/stt/v3/getRecognition?operation_id=${recognition.id}`,
        {
          headers: {
            Authorization: apiKey as string,
          },
          verbose: true,
        }
      );
      await api.tg.editMessage({
        message: answer,
        text: "🦻🤔🦻",
      });
      if (!recognitionResult.ok) {
        api.log.info(
          `Return code is ${recognitionResult.status}: ${recognitionResult}`
        );
        recursivelyFetchRecognition();
        return;
      }

      const text: [number, string][] = [];
      const chunk = await recognitionResult.text();
      const parts = chunk.split("\n");
      for (const part of parts) {
        try {
          const data = JSON.parse(part);
          text.push([
            Number.parseInt(data.result.finalRefinement.finalIndex),
            data.result.finalRefinement.normalizedText.alternatives[0].text,
          ]);
        } catch {
          continue;
        }
      }
      text.sort(([a, _], [b, __]) => a - b);
      const joinedText = text.map(([_, a]) => a).join("\n");
      const answerText = {
        text: joinedText,
        entities: [
          {
            _: "messageEntityBlockquote" as const,
            offset: 0,
            length: joinedText.length,
            collapsed: true,
          },
        ],
      };

      await api.tg.editMessage({
        message: answer,
        text: answerText,
      });
    }, 500);
  }
  recursivelyFetchRecognition();
}

export default {
  event_name: "new_message",
  checker,
  handler,
};
