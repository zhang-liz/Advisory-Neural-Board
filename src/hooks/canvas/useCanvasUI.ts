"use client";

import { useState, useRef, useEffect } from "react";
import { useScroll, useTransform, useMotionValueEvent } from "motion/react";
import type { AgentState } from "@/lib/canvas/types";
import { isNonEmptyAgentState, initialState } from "@/lib/canvas/state";
import useMediaQuery from "@/hooks/use-media-query";

/**
 * Custom hook for managing UI state, scroll behavior, and responsive design
 */
export function useCanvasUI(state: AgentState | undefined) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [showJsonView, setShowJsonView] = useState<boolean>(false);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const { scrollY } = useScroll({ container: scrollAreaRef });
  const headerScrollThreshold = 64;
  const headerOpacity = useTransform(scrollY, [0, headerScrollThreshold], [1, 0]);
  const [headerDisabled, setHeaderDisabled] = useState<boolean>(false);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const descTextareaRef = useRef<HTMLInputElement | null>(null);

  // Global cache for the last non-empty agent state (workaround for flicker)
  const cachedStateRef = useRef<AgentState>(state ?? initialState);
  useEffect(() => {
    if (isNonEmptyAgentState(state)) {
      cachedStateRef.current = state as AgentState;
    }
  }, [state]);

  // Use viewState to avoid transient flicker; TODO: troubleshoot and remove this workaround
  const viewState: AgentState = isNonEmptyAgentState(state) ? (state as AgentState) : cachedStateRef.current;

  // Handle scroll events for header behavior
  useMotionValueEvent(scrollY, "change", (y) => {
    const disable = y >= headerScrollThreshold;
    setHeaderDisabled(disable);
    if (disable) {
      titleInputRef.current?.blur();
      descTextareaRef.current?.blur();
    }
  });

  // Reset JSON view when there are no items
  useEffect(() => {
    const itemsCount = (viewState?.items ?? []).length;
    if (itemsCount === 0 && showJsonView) {
      setShowJsonView(false);
    }
  }, [viewState?.items, showJsonView]);

  // Get state preview for JSON view
  const getStatePreviewJSON = (s: AgentState | undefined): Record<string, unknown> => {
    const snapshot = (s ?? initialState) as AgentState;
    const { globalTitle, globalDescription, items } = snapshot;
    return {
      globalTitle: globalTitle ?? initialState.globalTitle,
      globalDescription: globalDescription ?? initialState.globalDescription,
      items: items ?? initialState.items,
    };
  };

  return {
    // Responsive design
    isDesktop,
    
    // View state
    viewState,
    showJsonView,
    setShowJsonView,
    getStatePreviewJSON,
    
    // Scroll behavior
    scrollAreaRef,
    scrollY,
    headerOpacity,
    headerDisabled,
    titleInputRef,
    descTextareaRef,
  };
}