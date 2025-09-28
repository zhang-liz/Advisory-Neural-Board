"use client";

import { useEffect, useCallback } from "react";
import type { AgentState } from "@/lib/canvas/types";

/**
 * Custom hook for Google Sheets integration and auto-sync functionality
 */
export function useGoogleSheets(state: AgentState | undefined) {
  
  // Auto-sync to Google Sheets when state changes
  useEffect(() => {
    const autoSyncToSheets = async () => {
      console.log("[AUTO-SYNC] Checking sync conditions:", {
        hasState: !!state,
        syncSheetId: state?.syncSheetId,
        itemsLength: state?.items?.length || 0
      });
      
      if (!state || !state.syncSheetId) {
        console.log("[AUTO-SYNC] Skipping - no sheet configured");
        return; // No sync needed - no sheet configured
      }
      
      try {
        console.log(`[AUTO-SYNC] Syncing ${state.items?.length || 0} items to sheet: ${state.syncSheetId}`);
        
        const response = await fetch('/api/sheets/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            canvas_state: state,
            sheet_id: state.syncSheetId,
            sheet_name: state.syncSheetName,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('[AUTO-SYNC] ✅ Successfully synced to Google Sheets:', result.message);
        } else {
          const error = await response.json();
          console.warn('[AUTO-SYNC] ❌ Failed to sync to Google Sheets:', error.error);
        }
      } catch (error) {
        console.warn('[AUTO-SYNC] ❌ Exception during auto-sync:', error);
      }
    };

    // Debounce the sync to avoid too many requests
    const timeoutId = setTimeout(autoSyncToSheets, 1000);
    return () => clearTimeout(timeoutId);
  }, [state]);

  // Create a new Google Sheet
  const createGoogleSheet = useCallback(async (title: string) => {
    try {
      const response = await fetch('/api/sheets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[SHEETS] ✅ Created new Google Sheet:', result);
        return result;
      } else {
        const error = await response.json();
        console.error('[SHEETS] ❌ Failed to create Google Sheet:', error);
        throw new Error(error.error);
      }
    } catch (error) {
      console.error('[SHEETS] ❌ Exception creating Google Sheet:', error);
      throw error;
    }
  }, []);

  // Get list of available sheets
  const listGoogleSheets = useCallback(async () => {
    try {
      const response = await fetch('/api/sheets/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[SHEETS] ✅ Retrieved sheets list:', result);
        return result;
      } else {
        const error = await response.json();
        console.error('[SHEETS] ❌ Failed to list Google Sheets:', error);
        throw new Error(error.error);
      }
    } catch (error) {
      console.error('[SHEETS] ❌ Exception listing Google Sheets:', error);
      throw error;
    }
  }, []);

  // Manually sync to Google Sheets
  const syncToGoogleSheets = useCallback(async (sheetId: string, sheetName?: string) => {
    if (!state) {
      throw new Error("No state available to sync");
    }

    try {
      const response = await fetch('/api/sheets/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          canvas_state: state,
          sheet_id: sheetId,
          sheet_name: sheetName,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[SHEETS] ✅ Successfully synced to Google Sheets:', result.message);
        return result;
      } else {
        const error = await response.json();
        console.error('[SHEETS] ❌ Failed to sync to Google Sheets:', error);
        throw new Error(error.error);
      }
    } catch (error) {
      console.error('[SHEETS] ❌ Exception during manual sync:', error);
      throw error;
    }
  }, [state]);

  return {
    createGoogleSheet,
    listGoogleSheets,
    syncToGoogleSheets,
  };
}