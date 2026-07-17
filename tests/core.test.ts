import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { HeuristicExtractor } from "../src/extract/heuristic.js";
import { exportMarkdown, targets } from "../src/export/markdown.js";
import { setScope, setStatus } from "../src/review/index.js";
import { validateCore } from "../src/validate/index.js";
import type { NormalizedConversation } from "../src/types.js";
const fixture = async () => JSON.parse(await readFile(new URL("../fixtures/synthetic/conversation.json", import.meta.url), "utf8")) as NormalizedConversation;
describe("regressions", () => {
  it("connects topic transitions with provenance", async () => { const c=await new HeuristicExtractor().extract(await fixture()); expect(c.interaction_patterns[0]).toMatchObject({status:"active",confidence:0.85}); expect(c.interaction_patterns[0].provenance[0].message_ids).toEqual(["m1","m2"]); expect((await validateCore(c)).valid).toBe(true); });
  it("reduces humor for serious content", async () => { const c=await new HeuristicExtractor().extract(await fixture()); expect(exportMarkdown(c,"generic-markdown")).toContain("reduce humor"); });
  it("excludes casual callbacks in work", async () => { const c=await new HeuristicExtractor().extract(await fixture()); expect(exportMarkdown(c,"generic-markdown","work")).not.toContain("Use the explicitly marked"); });
  it("excludes retracted callbacks", async () => { const c=await new HeuristicExtractor().extract(await fixture()); setStatus(c,c.callbacks[0].id,"retracted"); expect(exportMarkdown(c,"generic-markdown","casual")).not.toContain("fictional callback"); });
  it("keeps conflict as candidate", async () => { const x=await fixture(); x.messages[0].text+=" [conflict]"; expect((await new HeuristicExtractor().extract(x)).interaction_patterns[0]).toMatchObject({status:"candidate",confidence:0.4}); });
  it("does not infer identity from one line", async () => { const x=await fixture(); x.messages=[{...x.messages[0],text:"I am impatient today."}]; expect((await new HeuristicExtractor().extract(x)).interaction_patterns).toHaveLength(0); });
  it("edits scope and renders five targets", async () => { const c=await new HeuristicExtractor().extract(await fixture()); setScope(c,c.callbacks[0].id,"creative"); expect(c.metadata.audit_log).toHaveLength(1); for(const t of targets) expect(exportMarkdown(c,t)).toContain("Experimental"); });
});
