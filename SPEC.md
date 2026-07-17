# Conversation Core v0.1 Specification

The canonical JSON Schema is `schema/conversation-core.schema.json`. A core contains participants and five item collections: interaction patterns, callbacks, tone transitions, boundaries, and repair preferences.

Every item has a stable ID, type, summary, one or more scopes, lifecycle status, confidence from 0 to 1, sensitivity label, provenance, and timestamps. Supported statuses are `candidate`, `active`, `deprecated`, `retracted`, and `archived`. Supported scopes are `global`, `casual`, `work`, `creative`, `support`, and `technical`.

Active items must include source conversation and message references. Candidate items are hypotheses for review. Callbacks are contextual references, never factual claims by default. Exporters omit retracted, archived, deprecated, and out-of-scope content from instructions.

The normalized input format contains `conversation_id`, participants with IDs and roles, and messages with IDs, speaker IDs, ISO timestamps, and text. v0.1 provides no vendor chat-export importer.
