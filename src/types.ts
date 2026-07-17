export const sections = ["interaction_patterns", "callbacks", "tone_transitions", "boundaries", "repair_preferences"] as const;
export type Section = (typeof sections)[number];
export type ItemType = "interaction_pattern" | "callback" | "tone_transition" | "boundary" | "repair_preference";
export type Status = "candidate" | "active" | "deprecated" | "retracted" | "archived";
export type Scope = "global" | "casual" | "work" | "creative" | "support" | "technical";

export interface Participant { id: string; role: "user" | "assistant" | "system" | "other"; }
export interface Message { id: string; speaker_id: string; timestamp: string; text: string; }
export interface NormalizedConversation { conversation_id: string; participants: Participant[]; messages: Message[]; }
export interface Provenance { conversation_id: string; message_ids: string[]; }
export interface CoreItem {
  id: string; type: ItemType; summary: string; scope: Scope[]; status: Status;
  confidence: number; sensitivity: "low" | "moderate" | "high";
  provenance: Provenance[]; created_at: string; updated_at: string;
}
export interface ConversationCore {
  schema_version: "0.1.0"; core_id: string; participants: Participant[];
  interaction_patterns: CoreItem[]; callbacks: CoreItem[]; tone_transitions: CoreItem[];
  boundaries: CoreItem[]; repair_preferences: CoreItem[];
  metadata: { source_conversation_ids: string[]; generated_at: string; generator: string; audit_log?: AuditEntry[]; };
}
export interface AuditEntry { at: string; action: string; item_id: string; before: unknown; after: unknown; }
export interface CoreExtractor { extract(input: NormalizedConversation): Promise<ConversationCore>; }
