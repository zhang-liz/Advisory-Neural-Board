"use client";

import { useCopilotAdditionalInstructions } from "@copilotkit/react-core";
import type { AgentState, Item } from "@/lib/canvas/types";
import { initialState } from "@/lib/canvas/state";

interface AIInstructionsProps {
  viewState: AgentState;
}

/**
 * Component managing AI instructions and context for better agent grounding
 */
export function AIInstructions({ viewState }: AIInstructionsProps) {
  
  // Strengthen grounding: always prefer shared state over chat history
  useCopilotAdditionalInstructions({
    instructions: (() => {
      const items = viewState.items ?? initialState.items;
      const gTitle = viewState.globalTitle ?? "";
      const gDesc = viewState.globalDescription ?? "";
      const summary = items
        .slice(0, 5)
        .map((p: Item) => `id=${p.id} • name=${p.name} • type=${p.type}`)
        .join("\n");
      
      const fieldSchema = [
        "FIELD SCHEMA (authoritative):",
        "- project.data:",
        "  - field1: string (text)",
        "  - field2: string (select: 'Option A' | 'Option B' | 'Option C'; empty string means unset)",
        "  - field3: string (date 'YYYY-MM-DD')",
        "  - field4: ChecklistItem[] where ChecklistItem={id: string, text: string, done: boolean, proposed: boolean}",
        "- entity.data:",
        "  - field1: string",
        "  - field2: string (select: 'Option A' | 'Option B' | 'Option C'; empty string means unset)",
        "  - field3: string[] (selected tags; subset of field3_options)",
        "  - field3_options: string[] (available tags)",
        "- note.data:",
        "  - field1: string (textarea)",
        "- chart.data:",
        "  - field1: Array<{id: string, label: string, value: number | ''}> with value in [0..100] or ''",
      ].join("\n");
      
      const toolUsageHints = [
        "TOOL USAGE HINTS:",
        "- To create cards, call createItem with { type: 'project' | 'entity' | 'note' | 'chart', name?: string } and use returned id.",
        "- Prefer calling specific actions: setProjectField1, setProjectField2, setProjectField3, addProjectChecklistItem, setProjectChecklistItem, removeProjectChecklistItem.",
        "- field2 values: 'Option A' | 'Option B' | 'Option C' | '' (empty clears).",
        "- field3 accepts natural dates (e.g., 'tomorrow', '2025-01-30'); it will be normalized to YYYY-MM-DD.",
        "- Checklist edits accept either the generated id (e.g., '001') or a numeric index (e.g., '1', 1-based).",
        "- For charts, values are clamped to [0..100]; use clearChartField1Value to clear an existing metric value.",
        "- Card subtitle/description keywords (description, overview, summary, caption, blurb) map to setItemSubtitleOrDescription. Never write these to data.field1 for non-note items.",
        "LOOP CONTROL: When asked to 'add a couple' items, add at most 2 and stop. Avoid repeated calls to the same mutating tool in one turn.",
        "RANDOMIZATION: If the user specifically asks for random/mock values, you MAY generate and set them right away using the tools (do not block for more details).",
        "VERIFICATION: After tools run, re-read the latest state and confirm what actually changed.",
      ].join("\n");
      
      return [
        "ALWAYS ANSWER FROM SHARED STATE (GROUND TRUTH).",
        "If a command does not specify which item to change, ask the user to clarify before proceeding.",
        `Global Title: ${gTitle || "(none)"}`,
        `Global Description: ${gDesc || "(none)"}`,
        "Items (sample):",
        summary || "(none)",
        fieldSchema,
        toolUsageHints,
      ].join("\n");
    })(),
  });

  return null; // This component only provides instructions, no visual output
}