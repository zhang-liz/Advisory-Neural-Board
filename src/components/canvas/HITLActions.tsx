"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import type { AgentState, CardType } from "@/lib/canvas/types";
import { initialState } from "@/lib/canvas/state";
import { getContentArg } from "@/lib/utils";

interface HITLActionsProps {
  viewState: AgentState;
}

/**
 * Component containing Human-in-the-Loop (HITL) actions for AI disambiguation
 */
export function HITLActions({ viewState }: HITLActionsProps) {
  
  // Tool-based HITL: choose item
  useCopilotAction({
    name: "choose_item",
    description: "Ask the user to choose an item id from the canvas.",
    available: "remote",
    parameters: [
      { name: "content", type: "string", required: false, description: "Prompt to display." },
    ],
    renderAndWaitForResponse: ({ respond, args }) => {
      const items = viewState.items ?? initialState.items;
      if (!items.length) {
        return (
          <div className="rounded-md border bg-white p-4 text-sm shadow">
            <p>No items available.</p>
          </div>
        );
      }
      let selectedId = items[0].id;
      return (
        <div className="rounded-md border bg-white p-4 text-sm shadow">
          <p className="mb-2 font-medium">Select an item</p>
          <p className="mb-3 text-xs text-gray-600">{getContentArg(args) ?? "Which item should I use?"}</p>
          <select
            className="w-full rounded border px-2 py-1"
            defaultValue={selectedId}
            onChange={(e) => {
              selectedId = e.target.value;
            }}
          >
            {(items).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
          <div className="mt-3 flex justify-end gap-2">
            <button className="rounded border px-3 py-1" onClick={() => respond?.("")}>Cancel</button>
            <button className="rounded border bg-blue-600 px-3 py-1 text-white" onClick={() => respond?.(selectedId)}>Use item</button>
          </div>
        </div>
      );
    },
  });

  // Tool-based HITL: choose card type
  useCopilotAction({
    name: "choose_card_type",
    description: "Ask the user to choose a card type to create.",
    available: "remote",
    parameters: [
      { name: "content", type: "string", required: false, description: "Prompt to display." },
    ],
    renderAndWaitForResponse: ({ respond, args }) => {
      const options: { id: CardType; label: string }[] = [
        { id: "project", label: "Project" },
        { id: "entity", label: "Entity" },
        { id: "note", label: "Note" },
        { id: "chart", label: "Chart" },
      ];
      let selected: CardType | "" = "";
      return (
        <div className="rounded-md border bg-white p-4 text-sm shadow">
          <p className="mb-2 font-medium">Select a card type</p>
          <p className="mb-3 text-xs text-gray-600">{getContentArg(args) ?? "Which type of card should I create?"}</p>
          <select
            className="w-full rounded border px-2 py-1"
            defaultValue=""
            onChange={(e) => {
              selected = e.target.value as CardType;
            }}
          >
            <option value="" disabled>Select an item type…</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
          <div className="mt-3 flex justify-end gap-2">
            <button className="rounded border px-3 py-1" onClick={() => respond?.("")}>Cancel</button>
            <button
              className="rounded border bg-blue-600 px-3 py-1 text-white"
              onClick={() => selected && respond?.(selected)}
              disabled={!selected}
            >
              Use type
            </button>
          </div>
        </div>
      );
    },
  });

  return null; // This component only provides actions, no visual output
}