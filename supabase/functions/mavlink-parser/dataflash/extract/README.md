Purpose

- Transform ParsedLog into higher-level slices keyed by message type (params, modes, GPS/position, attitude, etc.).
- Remain schema-aware but unit-agnostic; no renaming/aliasing beyond what the FMT defines.

Guidelines

- Inputs: ExtractionContext wraps ParsedLog (optionally enriched).
- Outputs: ExtractionResult with name/data; keep data structures typed per extractor.
- Keep extractors pure and deterministic; avoid I/O or logging.
- Co-locate message-specific types with the extractor for discoverability.
