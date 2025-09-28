"use client";

import { useRef } from "react";
import { useCopilotAction } from "@copilotkit/react-core";
import type { AgentState, ItemData, ProjectData, EntityData, NoteData, ChartData, CardType } from "@/lib/canvas/types";
import { initialState } from "@/lib/canvas/state";
import { 
  projectAddField4Item, 
  projectSetField4ItemText, 
  projectSetField4ItemDone, 
  projectRemoveField4Item, 
  chartAddField1Metric, 
  chartSetField1Label, 
  chartSetField1Value, 
  chartRemoveField1Metric 
} from "@/lib/canvas/updates";

interface CopilotActionsProps {
  viewState: AgentState;
  updateItem: (itemId: string, updates: Partial<{id: string; name: string; subtitle: string; type: CardType; data: ItemData}>) => void;
  updateItemData: (itemId: string, updater: (prev: ItemData) => ItemData) => void;
  deleteItem: (itemId: string) => void;
  addItem: (type: CardType, name?: string) => string;
  setGlobalTitle: (title: string) => void;
  setGlobalDescription: (description: string) => void;
}

/**
 * Component containing all CopilotKit actions for canvas manipulation
 */
export function CopilotActions({ 
  viewState, 
  updateItem, 
  updateItemData, 
  deleteItem, 
  addItem,
  setGlobalTitle,
  setGlobalDescription 
}: CopilotActionsProps) {
  
  const lastChecklistCreationRef = useRef<Record<string, { text: string; id: string; ts: number }>>({});
  const lastMetricCreationRef = useRef<Record<string, { label: string; value: number | ""; id: string; ts: number }>>({});

  // Global actions
  useCopilotAction({
    name: "setGlobalTitle",
    description: "Set the global title/name (outside of items).",
    available: "remote",
    parameters: [
      { name: "title", type: "string", required: true, description: "The new global title/name." },
    ],
    handler: ({ title }: { title: string }) => {
      setGlobalTitle(title);
    },
  });

  useCopilotAction({
    name: "setGlobalDescription",
    description: "Set the global description/subtitle (outside of items).",
    available: "remote",
    parameters: [
      { name: "description", type: "string", required: true, description: "The new global description/subtitle." },
    ],
    handler: ({ description }: { description: string }) => {
      setGlobalDescription(description);
    },
  });

  // Item management actions
  useCopilotAction({
    name: "setItemName",
    description: "Set an item's name/title.",
    available: "remote",
    parameters: [
      { name: "name", type: "string", required: true, description: "The new item name/title." },
      { name: "itemId", type: "string", required: true, description: "Target item id." },
    ],
    handler: ({ name, itemId }: { name: string; itemId: string }) => {
      updateItem(itemId, { name });
    },
  });

  useCopilotAction({
    name: "setItemSubtitleOrDescription",
    description: "Set an item's description/subtitle (short description or subtitle).",
    available: "remote",
    parameters: [
      { name: "subtitle", type: "string", required: true, description: "The new item description/subtitle." },
      { name: "itemId", type: "string", required: true, description: "Target item id." },
    ],
    handler: ({ subtitle, itemId }: { subtitle: string; itemId: string }) => {
      updateItem(itemId, { subtitle });
    },
  });

  useCopilotAction({
    name: "createItem",
    description: "Create a new item (card) with the specified type and optional name.",
    available: "remote",
    parameters: [
      { name: "type", type: "string", required: true, description: "Card type: 'project', 'entity', 'note', or 'chart'." },
      { name: "name", type: "string", required: false, description: "Optional item name/title." },
    ],
    handler: ({ type, name }: { type: string; name?: string }) => {
      const cardType = type as CardType;
      const id = addItem(cardType, name);
      return id;
    },
  });

  useCopilotAction({
    name: "deleteItem",
    description: "Delete an item (card) by id.",
    available: "remote",
    parameters: [
      { name: "itemId", type: "string", required: true, description: "Item id to delete." },
    ],
    handler: ({ itemId }: { itemId: string }) => {
      deleteItem(itemId);
    },
  });

  // Note actions
  useCopilotAction({
    name: "setNoteField1",
    description: "Update note content (note.data.field1).",
    available: "remote",
    parameters: [
      { name: "value", type: "string", required: true, description: "New content for note.data.field1." },
      { name: "itemId", type: "string", required: true, description: "Target item id (note)." },
    ],
    handler: ({ value, itemId }: { value: string; itemId: string }) => {
      updateItemData(itemId, (prev) => {
        const nd = prev as NoteData;
        if (Object.prototype.hasOwnProperty.call(nd, "field1")) {
          return { ...(nd as NoteData), field1: value } as NoteData;
        }
        return prev;
      });
    },
  });

  useCopilotAction({
    name: "appendNoteField1",
    description: "Append text to note content (note.data.field1).",
    available: "remote",
    parameters: [
      { name: "value", type: "string", required: true, description: "Text to append to note.data.field1." },
      { name: "itemId", type: "string", required: true, description: "Target item id (note)." },
      { name: "withNewline", type: "boolean", required: false, description: "If true, prefix with a newline." },
    ],
    handler: ({ value, itemId, withNewline }: { value: string; itemId: string; withNewline?: boolean }) => {
      updateItemData(itemId, (prev) => {
        const nd = prev as NoteData;
        if (Object.prototype.hasOwnProperty.call(nd, "field1")) {
          const existing = (nd.field1 ?? "");
          const next = existing + (withNewline ? "\n" : "") + value;
          return { ...(nd as NoteData), field1: next } as NoteData;
        }
        return prev;
      });
    },
  });

  useCopilotAction({
    name: "clearNoteField1",
    description: "Clear note content (note.data.field1).",
    available: "remote",
    parameters: [
      { name: "itemId", type: "string", required: true, description: "Target item id (note)." },
    ],
    handler: ({ itemId }: { itemId: string }) => {
      updateItemData(itemId, (prev) => {
        const nd = prev as NoteData;
        if (Object.prototype.hasOwnProperty.call(nd, "field1")) {
          return { ...(nd as NoteData), field1: "" } as NoteData;
        }
        return prev;
      });
    },
  });

  // Project actions
  useCopilotAction({
    name: "setProjectField1",
    description: "Update project field1 (text).",
    available: "remote",
    parameters: [
      { name: "value", type: "string", required: true, description: "New value for field1." },
      { name: "itemId", type: "string", required: true, description: "Target item id." },
    ],
    handler: ({ value, itemId }: { value: string; itemId: string }) => {
      const safeValue = String((value as unknown as string) ?? "");
      updateItemData(itemId, (prev) => {
        const anyPrev = prev as { field1?: string };
        if (typeof anyPrev.field1 === "string") {
          return { ...anyPrev, field1: safeValue } as ItemData;
        }
        return prev;
      });
    },
  });

  useCopilotAction({
    name: "setProjectField2",
    description: "Update project field2 (select).",
    available: "remote",
    parameters: [
      { name: "value", type: "string", required: true, description: "New value for field2." },
      { name: "itemId", type: "string", required: true, description: "Target item id." },
    ],
    handler: ({ value, itemId }: { value: string; itemId: string }) => {
      const safeValue = String((value as unknown as string) ?? "");
      updateItemData(itemId, (prev) => {
        const anyPrev = prev as { field2?: string };
        if (typeof anyPrev.field2 === "string") {
          return { ...anyPrev, field2: safeValue } as ItemData;
        }
        return prev;
      });
    },
  });

  useCopilotAction({
    name: "setProjectField3",
    description: "Update project field3 (date, YYYY-MM-DD).",
    available: "remote",
    parameters: [
      { name: "date", type: "string", required: true, description: "Date in YYYY-MM-DD format." },
      { name: "itemId", type: "string", required: true, description: "Target item id." },
    ],
    handler: (args: { date?: string; itemId: string } & Record<string, unknown>) => {
      const itemId = String(args.itemId);
      const dictArgs = args as Record<string, unknown>;
      const rawInput = (dictArgs["date"]) ?? (dictArgs["value"]) ?? (dictArgs["val"]) ?? (dictArgs["text"]);
      
      const normalizeDate = (input: unknown): string | null => {
        if (input == null) return null;
        if (input instanceof Date && !isNaN(input.getTime())) {
          const yyyy = input.getUTCFullYear();
          const mm = String(input.getUTCMonth() + 1).padStart(2, "0");
          const dd = String(input.getUTCDate()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        }
        const asString = String(input);
        // Already in YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(asString)) return asString;
        const parsed = new Date(asString);
        if (!isNaN(parsed.getTime())) {
          const yyyy = parsed.getUTCFullYear();
          const mm = String(parsed.getUTCMonth() + 1).padStart(2, "0");
          const dd = String(parsed.getUTCDate()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        }
        return null;
      };
      
      const normalized = normalizeDate(rawInput);
      if (!normalized) return;
      
      updateItemData(itemId, (prev) => {
        const anyPrev = prev as { field3?: string };
        if (typeof anyPrev.field3 === "string") {
          return { ...anyPrev, field3: normalized } as ItemData;
        }
        return prev;
      });
    },
  });

  useCopilotAction({
    name: "clearProjectField3",
    description: "Clear project field3 (date).",
    available: "remote",
    parameters: [
      { name: "itemId", type: "string", required: true, description: "Target item id." },
    ],
    handler: ({ itemId }: { itemId: string }) => {
      updateItemData(itemId, (prev) => {
        const anyPrev = prev as { field3?: string };
        if (typeof anyPrev.field3 === "string") {
          return { ...anyPrev, field3: "" } as ItemData;
        }
        return prev;
      });
    },
  });

  // Project checklist actions
  useCopilotAction({
    name: "addProjectChecklistItem",
    description: "Add a new checklist item to a project.",
    available: "remote",
    parameters: [
      { name: "itemId", type: "string", required: true, description: "Target item id (project)." },
      { name: "text", type: "string", required: false, description: "Initial checklist text (optional)." },
    ],
    handler: ({ itemId, text }: { itemId: string; text?: string }) => {
      const norm = (text ?? "").trim();
      // 1) If a checklist item with same text exists, return its id
      const project = (viewState.items ?? initialState.items).find((it) => it.id === itemId);
      if (project && project.type === "project") {
        const list = ((project.data as ProjectData).field4 ?? []);
        const dup = norm ? list.find((c) => (c.text ?? "").trim() === norm) : undefined;
        if (dup) return dup.id;
      }
      // 2) Per-project throttle to avoid rapid duplicates
      const now = Date.now();
      const key = `${itemId}`;
      const recent = lastChecklistCreationRef.current[key];
      if (recent && recent.text === norm && now - recent.ts < 800) {
        return recent.id;
      }
      let createdId = "";
      updateItemData(itemId, (prev) => {
        const { next, createdId: id } = projectAddField4Item(prev as ProjectData, text);
        createdId = id;
        return next;
      });
      lastChecklistCreationRef.current[key] = { text: norm, id: createdId, ts: now };
      return createdId;
    },
  });

  useCopilotAction({
    name: "setProjectChecklistItem",
    description: "Update a project's checklist item text and/or done state.",
    available: "remote",
    parameters: [
      { name: "itemId", type: "string", required: true, description: "Target item id (project)." },
      { name: "checklistItemId", type: "string", required: true, description: "Checklist item id." },
      { name: "text", type: "string", required: false, description: "New text (optional)." },
      { name: "done", type: "boolean", required: false, description: "Done status (optional)." },
    ],
    handler: (args) => {
      const itemId = String(args.itemId ?? "");
      const target = args.checklistItemId ?? args.itemId;
      let targetId = target != null ? String(target) : "";
      const maybeDone = args.done;
      const text: string | undefined = args.text != null ? String(args.text) : undefined;
      const toBool = (v: unknown): boolean | undefined => {
        if (typeof v === "boolean") return v;
        if (typeof v === "string") {
          const s = v.trim().toLowerCase();
          if (s === "true") return true;
          if (s === "false") return false;
        }
        return undefined;
      };
      const done = toBool(maybeDone);
      updateItemData(itemId, (prev) => {
        let next = prev as ProjectData;
        const list = (next.field4 ?? []);
        // If a plain numeric was provided, allow using it as index (0- or 1-based)
        if (!list.some((c) => c.id === targetId) && /^\d+$/.test(targetId)) {
          const n = parseInt(targetId, 10);
          let idx = -1;
          if (n >= 0 && n < list.length) idx = n; // 0-based
          else if (n > 0 && n - 1 < list.length) idx = n - 1; // 1-based
          if (idx >= 0) targetId = list[idx].id;
        }
        if (typeof text === "string") next = projectSetField4ItemText(next, targetId, text);
        if (typeof done === "boolean") next = projectSetField4ItemDone(next, targetId, done);
        return next;
      });
    },
  });

  useCopilotAction({
    name: "removeProjectChecklistItem",
    description: "Remove a checklist item from a project by id.",
    available: "remote",
    parameters: [
      { name: "itemId", type: "string", required: true, description: "Target item id (project)." },
      { name: "checklistItemId", type: "string", required: true, description: "Checklist item id to remove." },
    ],
    handler: ({ itemId, checklistItemId }: { itemId: string; checklistItemId: string }) => {
      updateItemData(itemId, (prev) => projectRemoveField4Item(prev as ProjectData, checklistItemId));
    },
  });

  // Entity actions
  useCopilotAction({
    name: "setEntityField1",
    description: "Update entity field1 (text).",
    available: "remote",
    parameters: [
      { name: "value", type: "string", required: true, description: "New value for field1." },
      { name: "itemId", type: "string", required: true, description: "Target item id (entity)." },
    ],
    handler: ({ value, itemId }: { value: string; itemId: string }) => {
      updateItemData(itemId, (prev) => {
        const anyPrev = prev;
        if (typeof anyPrev.field1 === "string") {
          return { ...anyPrev, field1: value } as ItemData;
        }
        return prev;
      });
    },
  });

  useCopilotAction({
    name: "setEntityField2",
    description: "Update entity field2 (select).",
    available: "remote",
    parameters: [
      { name: "value", type: "string", required: true, description: "New value for field2." },
      { name: "itemId", type: "string", required: true, description: "Target item id (entity)." },
    ],
    handler: ({ value, itemId }: { value: string; itemId: string }) => {
      updateItemData(itemId, (prev) => {
        const anyPrev = prev as { field2?: string };
        if (typeof anyPrev.field2 === "string") {
          return { ...anyPrev, field2: value } as ItemData;
        }
        return prev;
      });
    },
  });

  useCopilotAction({
    name: "addEntityField3",
    description: "Add a tag to entity field3 (tags) if not present.",
    available: "remote",
    parameters: [
      { name: "tag", type: "string", required: true, description: "Tag to add." },
      { name: "itemId", type: "string", required: true, description: "Target item id (entity)." },
    ],
    handler: ({ tag, itemId }: { tag: string; itemId: string }) => {
      updateItemData(itemId, (prev) => {
        const e = prev as EntityData;
        const current = new Set<string>((e.field3 ?? []) as string[]);
        current.add(tag);
        return { ...e, field3: Array.from(current) } as EntityData;
      });
    },
  });

  useCopilotAction({
    name: "removeEntityField3",
    description: "Remove a tag from entity field3 (tags) if present.",
    available: "remote",
    parameters: [
      { name: "tag", type: "string", required: true, description: "Tag to remove." },
      { name: "itemId", type: "string", required: true, description: "Target item id (entity)." },
    ],
    handler: ({ tag, itemId }: { tag: string; itemId: string }) => {
      updateItemData(itemId, (prev) => {
        const e = prev as EntityData;
        return { ...e, field3: ((e.field3 ?? []) as string[]).filter((t) => t !== tag) } as EntityData;
      });
    },
  });

  // Chart actions
  useCopilotAction({
    name: "addChartField1",
    description: "Add a new metric (field1 entries).",
    available: "remote",
    parameters: [
      { name: "itemId", type: "string", required: true, description: "Target item id (chart)." },
      { name: "label", type: "string", required: false, description: "Metric label (optional)." },
      { name: "value", type: "number", required: false, description: "Metric value 0..100 (optional)." },
    ],
    handler: ({ itemId, label, value }: { itemId: string; label?: string; value?: number }) => {
      const normLabel = (label ?? "").trim();
      // 1) If a metric with same label exists, return its id
      const item = (viewState.items ?? initialState.items).find((it) => it.id === itemId);
      if (item && item.type === "chart") {
        const list = ((item.data as ChartData).field1 ?? []);
        const dup = normLabel ? list.find((m) => (m.label ?? "").trim() === normLabel) : undefined;
        if (dup) return dup.id;
      }
      // 2) Per-chart throttle to avoid rapid duplicates
      const now = Date.now();
      const key = `${itemId}`;
      const recent = lastMetricCreationRef.current[key];
      const valKey: number | "" = typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : "";
      if (recent && recent.label === normLabel && recent.value === valKey && now - recent.ts < 800) {
        return recent.id;
      }
      let createdId = "";
      updateItemData(itemId, (prev) => {
        const { next, createdId: id } = chartAddField1Metric(prev as ChartData, label, value);
        createdId = id;
        return next;
      });
      lastMetricCreationRef.current[key] = { label: normLabel, value: valKey, id: createdId, ts: now };
      return createdId;
    },
  });

  return null; // This component only provides actions, no visual output
}