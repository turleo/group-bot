import type { Api } from "@/api/types";

import type { Recognition } from "../types/recognition";
import { RecognitionStatus } from "../types/recognitionStatus";

const FETCH_TIMEOUT = 500;

interface YandexRecognitionResult {
  result: {
    finalRefinement: {
      normalizedText: {
        alternatives: YandexAlternative[];
      };
    };
  };
}

interface YandexAlternative {
  text: string;
}

function recognitionResultToText(result: string): string {
  const parts = result.split("\n");
  for (const part of parts) {
    try {
      const data = JSON.parse(part) as YandexRecognitionResult;
      const correctAlternative = data.result.finalRefinement.normalizedText.alternatives.find(alternative => alternative.text);
      return correctAlternative?.text ?? "";
    }
    catch {
      // Handled service event
    }
  }
  return "";
}

async function recursivelyFetchRecognition(
  api: Api,
  recognitionId: string,
  apiKey: string,
): Promise<Recognition> {
  const recognitionResult = await fetch(
    `https://stt.api.cloud.yandex.net:443/stt/v3/getRecognition?operation_id=${recognitionId}`,
    {
      headers: {
        Authorization: apiKey,
      },
      proxy: "http://localhost:8080",
      tls: {
        rejectUnauthorized: false,
      },
    },
  );
  if (!recognitionResult.ok) {
    api.log.debug(
      `Return code is ${recognitionResult.status.toString()}`,
    );
    await new Promise((resolve) => {
      setTimeout(resolve, FETCH_TIMEOUT);
    });
    return recursivelyFetchRecognition(api, recognitionId, apiKey);
  }

  const answer = await recognitionResult.text();
  return {
    status: RecognitionStatus.Done,
    text: recognitionResultToText(answer),
  };
}

export async function* recognizeSpeech(api: Api, file: Uint8Array): AsyncIterable<Recognition> {
  const apiKey = api.config.YA_CLOUD_AUTH;
  if (typeof api.config.YA_CLOUD_AUTH !== "string") {
    throw new TypeError(`YA_CLOUD_AUTH is not string but ${typeof apiKey}`);
  }

  yield {
    status: RecognitionStatus.Loading,
  };

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

  yield await recursivelyFetchRecognition(api, recognition.id, apiKey as string);
}
