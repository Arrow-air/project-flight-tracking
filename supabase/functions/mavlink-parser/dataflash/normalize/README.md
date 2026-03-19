Purpose (planned)

- Provide cleanup/consistency on top of extraction: unit normalization, field aliasing, gap-filling, deduplication, and ordering to yield a NormalizedLog ready for analysis.

Guidelines

- Inputs: ParsedLog (or ExtractedLog) from extract/.
- Outputs: NormalizedLog with stable field names and units.
- Keep transformation rules declarative (maps/tables) to ease testing and updates.
- Avoid domain analysis here; reserve that for a separate analysis layer.
