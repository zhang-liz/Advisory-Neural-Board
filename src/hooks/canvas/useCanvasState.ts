"use client";

import { useCallback } from "react";
import { useCoAgent } from "@copilotkit/react-core";
import type { AgentState, Item, ItemData, CardType } from "@/lib/canvas/types";
import { initialState } from "@/lib/canvas/state";

/**
 * Custom hook for managing canvas state and basic operations
 */
export function useCanvasState() {
  const { state, setState } = useCoAgent<AgentState>({
    name: "sample_agent",
    initialState,
  });

  // Update an entire item
  const updateItem = useCallback(
    (itemId: string, updates: Partial<Item>) => {
      setState((prev) => {
        const base = prev ?? initialState;
        const items: Item[] = base.items ?? [];
        const nextItems = items.map((p) => (p.id === itemId ? { ...p, ...updates } : p));
        return { ...base, items: nextItems } as AgentState;
      });
    },
    [setState]
  );

  // Update item data with a function
  const updateItemData = useCallback(
    (itemId: string, updater: (prev: ItemData) => ItemData) => {
      setState((prev) => {
        const base = prev ?? initialState;
        const items: Item[] = base.items ?? [];
        const nextItems = items.map((p) => (p.id === itemId ? { ...p, data: updater(p.data) } : p));
        return { ...base, items: nextItems } as AgentState;
      });
    },
    [setState]
  );

  // Delete an item
  const deleteItem = useCallback((itemId: string) => {
    setState((prev) => {
      const base = prev ?? initialState;
      const existed = (base.items ?? []).some((p) => p.id === itemId);
      const items: Item[] = (base.items ?? []).filter((p) => p.id !== itemId);
      return { ...base, items, lastAction: existed ? `deleted:${itemId}` : `not_found:${itemId}` } as AgentState;
    });
  }, [setState]);

  // Toggle entity tag
  const toggleTag = useCallback((itemId: string, tag: string) => {
    updateItemData(itemId, (prev) => {
      const anyPrev = prev as { field3?: string[] };
      if (Array.isArray(anyPrev.field3)) {
        const selected = new Set<string>(anyPrev.field3 ?? []);
        if (selected.has(tag)) selected.delete(tag); else selected.add(tag);
        return { ...anyPrev, field3: Array.from(selected) } as ItemData;
      }
      return prev;
    });
  }, [updateItemData]);

  // Set global title
  const setGlobalTitle = useCallback((title: string) => {
    setState((prev) => ({ ...(prev ?? initialState), globalTitle: title }));
  }, [setState]);

  // Set global description
  const setGlobalDescription = useCallback((description: string) => {
    setState((prev) => ({ ...(prev ?? initialState), globalDescription: description }));
  }, [setState]);

  return {
    state,
    setState,
    updateItem,
    updateItemData,
    deleteItem,
    toggleTag,
    setGlobalTitle,
    setGlobalDescription,
  };
}