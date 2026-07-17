# Conversation Core

Conversation Core is an experimental open format and reference implementation for extracting, reviewing, and migrating conversational patterns and relational context between AI systems.

It is an early open reference implementation. It models reviewable interaction patterns, contextual callbacks, tone transitions, boundaries, repair preferences, confidence, scope, lifecycle, and provenance. Conversational patterns differ from factual memory: they are contextual hypotheses about how an exchange works, not claims about a person or the world.

## What it is not

Conversation Core is not consciousness transfer, guaranteed identity preservation, permanent memory, a full chat-history migration service, a psychological profiling system, or a substitute for human review.

## Quick start

Requires Node.js 22 or later.

```sh
npm install
npm run build
npm test
npm run cli -- extract fixtures/synthetic/conversation.json --output conversation_core.json
npm run cli -- validate conversation_core.json
```

The normalized input has `conversation_id`, `participants`, and timestamped `messages`. The reviewed output follows [`schema/conversation-core.schema.json`](schema/conversation-core.schema.json). See [`fixtures/synthetic/conversation.json`](fixtures/synthetic/conversation.json) and [`examples/conversation_core.example.json`](examples/conversation_core.example.json).

## Review workflow

```sh
npm run cli -- inspect conversation_core.json
npm run cli -- activate conversation_core.json interaction_pattern-001
npm run cli -- retract conversation_core.json callback-001
npm run cli -- archive conversation_core.json callback-001
npm run cli -- set-scope conversation_core.json callback-001 casual
npm run cli -- set-confidence conversation_core.json interaction_pattern-001 0.65
```

Mutations append an audit entry. Retraction and archival preserve records rather than silently deleting them.

## Target exports

```sh
npm run cli -- export conversation_core.json --target generic-markdown --scope casual
```

Targets: `generic-markdown`, `chatgpt-custom-instructions`, `claude-project-instructions`, `gemini-gem-instructions`, and `local-system-prompt`. Active in-scope instructions and candidate patterns are distinguished; retracted and archived items are omitted. Cross-system behavior is not guaranteed.

## Privacy warning

Only process logs you have permission to use. Human review is required before migration. Never commit private imports, exports, credentials, or real conversation logs. See [PRIVACY.md](PRIVACY.md), [SECURITY.md](SECURITY.md), and [LIMITATIONS.md](LIMITATIONS.md).

## Project status

`0.1.0-alpha.1` is experimental. The default extractor is deterministic and offline; it recognizes explicit fixture markers and avoids open-ended personal inference.

## Prior and related work

This project does not claim AI memory portability or relational memory is new. Relevant areas include portable AI memory formats, agent-memory portability, relational or “we memory” research, long-term conversational memory, and persona-conditioned dialogue. Citations and adapters will be developed carefully in later releases.

The narrower focus here is the reviewable extraction and migration of interaction patterns, contextual callbacks, tone transitions, boundaries, and repair preferences as a portable conversation core.

## License

Apache License 2.0. See [LICENSE](LICENSE).
