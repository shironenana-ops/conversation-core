import { sections, type ConversationCore, type CoreItem, type Scope, type Status } from "../types.js";

export function findItem(core: ConversationCore, id: string): CoreItem {
  for (const section of sections) {
    const item = core[section].find((entry) => entry.id === id);
    if (item) return item;
  }
  throw new Error(`Item not found: ${id}`);
}

export function updateItem(core: ConversationCore, id: string, action: string, mutate: (item: CoreItem) => void): ConversationCore {
  const item = findItem(core, id);
  const before = structuredClone(item);
  mutate(item);
  item.updated_at = new Date().toISOString();
  core.metadata.audit_log ??= [];
  core.metadata.audit_log.push({ at: item.updated_at, action, item_id: id, before, after: structuredClone(item) });
  return core;
}
export const setStatus = (core: ConversationCore, id: string, status: Status) => updateItem(core, id, status, (item) => { item.status = status; });
export const setScope = (core: ConversationCore, id: string, scope: Scope) => updateItem(core, id, "set-scope", (item) => { item.scope = [scope]; });
export const setConfidence = (core: ConversationCore, id: string, confidence: number) => updateItem(core, id, "set-confidence", (item) => { item.confidence = confidence; });
