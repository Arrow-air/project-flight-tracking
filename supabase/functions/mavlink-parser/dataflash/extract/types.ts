import type { ParsedLog } from "../core/types.ts";


/**
 * Context for data extraction.
 * 
 * @property parsed - The parsed log data.
 */
export interface ExtractionContext {
  parsed: ParsedLog;
}


/**
 * Result of an extraction operation.
 * 
 * @property name - The name of the extracted data.
 * @property data - The extracted data.
 * 
 * 
 * @example For extracting parameter summaries from a log:
 * ```
 * ExtractionResult<"paramSummary", ParamSummaryRecord[]>
 * ```
 */
export interface ExtractionResult<Name extends string, Payload> {
  name: Name;
  data: Payload;
}


/**
 * Extractor interface.
 * 
 * @template Name - The name of the extracted data.
 * @template Payload - The type of the extracted data.
 */
export interface Extractor<Name extends string = string, Payload = unknown> {
  extract(ctx: ExtractionContext): ExtractionResult<Name, Payload> | null;
}
