"use client";

import { useCallback, useRef } from "react";
import type { AgentState, Item, ItemData, ProjectData, EntityData, NoteData, ChartData, CardType } from "@/lib/canvas/types";
import { initialState } from "@/lib/canvas/state";

/**
 * Custom hook for managing item creation with deduplication and throttling
 */
export function useItemCreation(setState: (updater: (prev: AgentState | undefined) => AgentState) => void) {
  const lastCreationRef = useRef<{ type: CardType; name: string; id: string; ts: number } | null>(null);

  // Helper to generate default data by type
  const defaultDataFor = useCallback((type: CardType): ItemData => {
    switch (type) {
      case "project":
        return {
          field1: "",
          field2: "",
          field3: "",
          field4: [],
          field4_id: 0,
        } as ProjectData;
      case "entity":
        return {
          field1: "",
          field2: "",
          field3: [],
          field3_options: ["Tag 1", "Tag 2", "Tag 3"],
        } as EntityData;
      case "note":
        return { field1: "" } as NoteData;
      case "chart":
        return { field1: [], field1_id: 0 } as ChartData;
      default:
        return { content: "" } as NoteData;
    }
  }, []);

  // Add a new item with deduplication
  const addItem = useCallback((type: CardType, name?: string) => {
    const t: CardType = type;
    let createdId = "";
    
    setState((prev) => {
      const base = prev ?? initialState;
      const items: Item[] = base.items ?? [];
      
      // Derive next numeric id robustly from both itemsCreated counter and max existing id
      const maxExisting = items.reduce((max, it) => {
        const parsed = Number.parseInt(String(it.id ?? "0"), 10);
        return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
      }, 0);
      const priorCount = Number.isFinite(base.itemsCreated) ? (base.itemsCreated as number) : 0;
      const nextNumber = Math.max(priorCount, maxExisting) + 1;
      createdId = String(nextNumber).padStart(4, "0");
      
      const item: Item = {
        id: createdId,
        type: t,
        name: name && name.trim() ? name.trim() : "",
        subtitle: "",
        data: defaultDataFor(t),
      };
      
      const nextItems = [...items, item];
      return { ...base, items: nextItems, itemsCreated: nextNumber, lastAction: `created:${createdId}` } as AgentState;
    });
    
    // Update creation throttle
    lastCreationRef.current = {
      type: t,
      name: name || "",
      id: createdId,
      ts: Date.now()
    };
    
    return createdId;
  }, [defaultDataFor, setState]);

  // Check if recent creation exists (for deduplication)
  const hasRecentCreation = useCallback((type: CardType, name?: string) => {
    const recent = lastCreationRef.current;
    if (!recent) return false;
    
    const timeDiff = Date.now() - recent.ts;
    const withinThrottleWindow = timeDiff < 5000; // 5 seconds
    const sameType = recent.type === type;
    const sameName = recent.name === (name || "");
    
    return withinThrottleWindow && sameType && sameName;
  }, []);

  return {
    addItem,
    hasRecentCreation,
    defaultDataFor,
  };
}