import Ajv2020 from "ajv/dist/2020.js";
import type { ErrorObject } from "ajv";
import { readFile } from "node:fs/promises";
import type { ConversationCore } from "../types.js";

export async function validateCore(core: unknown): Promise<{ valid: boolean; errors: string[] }> {
  const schemaUrl = new URL("../../schema/conversation-core.schema.json", import.meta.url);
  const schema = JSON.parse(await readFile(schemaUrl, "utf8"));
  const AjvConstructor = Ajv2020 as unknown as new (options: { allErrors: boolean }) => { compile: (schema: object) => { (data: unknown): boolean; errors?: ErrorObject[] | null } };
  const validate = new AjvConstructor({ allErrors: true }).compile(schema);
  const valid = validate(core) as boolean;
  const errors = (validate.errors ?? []).map((e: ErrorObject) => `${e.instancePath || "/"} ${e.message}`);
  if (valid) {
    const typed = core as ConversationCore;
    for (const section of [typed.interaction_patterns, typed.callbacks, typed.tone_transitions, typed.boundaries, typed.repair_preferences]) {
      for (const item of section.filter((i) => i.status === "active")) if (!item.provenance.length || item.provenance.some((p) => !p.message_ids.length)) errors.push(`${item.id} active item lacks provenance`);
    }
  }
  return { valid: valid && errors.length === 0, errors };
}
