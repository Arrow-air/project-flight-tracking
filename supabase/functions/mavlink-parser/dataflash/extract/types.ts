import type { ParsedLog } from "../core/types.ts";


export interface ExtractionContext {
  parsed: ParsedLog;
}

export interface ExtractionResult<Name extends string, Payload> {
  name: Name;
  data: Payload;
}

export interface Extractor<Name extends string = string, Payload = unknown> {
  extract(ctx: ExtractionContext): ExtractionResult<Name, Payload> | null;
}
