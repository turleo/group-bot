import type { RecognitionStatus } from "./recognitionStatus";

export interface Recognition {
  status: RecognitionStatus;
  text?: string;
};
