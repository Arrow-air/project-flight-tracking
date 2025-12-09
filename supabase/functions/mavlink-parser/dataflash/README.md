# Dataflash Parser

## Module Layout

- core/ – Binary decoding primitives and schema helpers. Buffer readers, header scanning, FMT parsing, and the parser class that turns bytes into ParsedLog. No ArduPilot semantics beyond the wire format.
- extract/ – Schema-aware shaping of ParsedLog into per-message slices (params, mode timeline, position, attitude, etc). Pure transforms, no unit coercion or domain opinions.
- normalize/ – (planned) Cleanup/consistency layer: unit scaling, field aliases, deduping, and gap-filling to produce a NormalizedLog ready for analysis. Keep rules declarative and testable.
- enrich/ – Post-processing helpers that augment ParsedLog (already present).

## Core

Functionality for pure binary handling and parsing primitives:
- buffer/header scanning
- FMT decoding
- field readers
- shared constants/types.

### Binary Parsing

Taking from the great work of the Ardupilot contributors, we implement a Typescript implementation of the Dataflash log parser. Within this module, we have taken great care to separate parsing into logical, minimal layers for data handling.

While it is possible to declaratively set the complete structure of each message type, such as in [LogStructure.h](https://gitlab.nps.edu/sasc/ardupilot/-/blob/ae4dae171580e15ec9cdcd949cecf4f6a58df3e4/libraries/DataFlash/LogStructure.h) in the Ardupilot repo, we hope to accomplish more flexibility by leaning into the [self-describing](#self-describing-message-format) nature of the Dataflash logs.



### Self-Describing Message Format

Dataflash logs are nice because they adopt a self-describing format. At the beginning of each log, we expect to see a number of `FMT` messages, which are simply messages that describe other messages. If we know how to read the `FMT` messages, we can use that to decode the rest of the messages in the log.

#### Dataflash Headers

So how does one decode the `FMT` messages?

First, every Dataflash message has two components: the header and the payload. The message has the following format:

```
HEADER1  HEADER2  TYPE  PAYLOAD...
A3       95       tt    [tt-specific payload]
```

The header is the first three bytes:
1. **0xA3** (Decimal 163)
2. **0x95** (Decimal 149)
3. **Type** (value between 0-255)

The **Type** tells us what kind of message we are going to find in the following payload. 

To start, we only need to know that the type ID for `FMT` messages is **128**.

*Notes:*

> Header definition values and types will be found in `core/constants.ts` and `core/types.ts` respectively.



#### Message Payload

Following the header we recieve the message payload. Naturally, different message types will have different fields and overall lengths. The point of `FMT` messages is to tell us what to expect for each message type in our log.

Again, we must know how to first interpret the `FMT` message. Here is the definition from `core/types.ts`:

```
export interface FmtRecord {
  typeId: MessageTypeId;   // The type identifier for this message type.
  length: number;          // The length of the message in bytes.
  name: MessageTypeName;   // The name of the message type.
  format: string;          // The format of the message.
  columns: string;         // The comma-separated columns of the message, in a single string.
}
```

This payload gives information on how a different type will be defined, including the format, column names, and overall length of a message type. 

Our parser keeps track of these message format definitions in a *format table*. Later, when we come across a message header like:

```
0xA3 0x95 0x16
```

we look up the format for message type ID *0x16* in our table to see how to decode it.

#### Decoding Messages

To bring it together we will use an example. 

First, we recieve a `FMT` message, describing a coming message.




### Message Type Vocabulary



