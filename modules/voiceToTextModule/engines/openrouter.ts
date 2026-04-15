/* eslint-disable camelcase */
import type { Api } from "@/api/types";

import type { Recognition } from "../types/recognition";
import { RecognitionStatus } from "../types/recognitionStatus";

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

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

function parseResponse(response: OpenRouterResponse): string {
  return response.choices[0].message.content;
}

export async function* recognizeSpeech(api: Api, file: Uint8Array): AsyncIterable<Recognition> {
  yield {
    status: RecognitionStatus.Loading,
  };
  const { apiKey, model } = getOpenRouterConfig(api);
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    body: JSON.stringify({
      messages: [
        {
          content: "You are an accurate speech-to-text transcription assistant. Transcribe the provided audio into clean, readable text. Preserve the speaker's meaning and include natural punctuation, sentence boundaries, capitalization, and grammar as implied by the speech. Use best-effort interpretation for unclear words based on context. Return only the final transcript text, with no commentary, labels, or extra formatting.",
          role: "system",
        },
        {
          content: [
            {
              input_audio: {
                data: file.toBase64(),
                format: "opus",
              },
              type: "input_audio",
            },
          ],
          role: "user",
        },
      ],
      model,
    }),
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  const json = await response.json() as OpenRouterResponse;

  yield {
    status: RecognitionStatus.Done,
    text: parseResponse(json),
  };
}
