/* eslint-disable camelcase */
import type { Api } from "@/api/types";

import type { Recognition } from "../types/recognition";
import { RecognitionStatus } from "../types/recognitionStatus";

function getOpenRouterConfig(api: Api) {
  const apiKey = api.config.OPEN_ROUTER_API_KEY;
  if (typeof apiKey !== "string") {
    throw new TypeError(`OPEN_ROUTER_API_KEY is not string but ${typeof apiKey}`);
  }
  const model = api.config.OPEN_ROUTER_MODEL;
  if (typeof model !== "string") {
    throw new TypeError(`OPEN_ROUTER_MODEL is not string but ${typeof model}`);
  }
  return { apiKey, model };
}

export async function* recognizeSpeech(api: Api, file: Uint8Array): AsyncIterable<Recognition> {
  yield {
    status: RecognitionStatus.Loading,
  };
  const { apiKey, model } = getOpenRouterConfig(api);
  const response = await fetch("https://openrouter.ai/api/v1/audio/transcriptions", {
    body: JSON.stringify({
      input_audio: {
        data: file.toBase64(),
        format: "ogg",
      },
      model,
    }),
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/turleo/group-bot",
      "X-OpenRouter-Title": "@turleo_group_bot",
    },
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  const json = await response.json() as { text: string };

  yield {
    status: RecognitionStatus.Done,
    text: json.text,
  };
}
