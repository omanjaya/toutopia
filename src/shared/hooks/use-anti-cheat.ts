"use client";

import { useEffect, useRef, useCallback } from "react";
import { ANTI_CHEAT } from "@/shared/lib/constants";

interface UseAntiCheatOptions {
  attemptId: string;
  enabled: boolean;
  maxViolations?: number;
  onMaxViolations?: () => void;
}

export function useAntiCheat({
  attemptId,
  enabled,
  maxViolations = ANTI_CHEAT.MAX_VIOLATIONS_DEFAULT,
  onMaxViolations,
}: UseAntiCheatOptions) {
  const violationCount = useRef(0);

  const logViolation = useCallback(
    async (type: string, details?: string) => {
      violationCount.current += 1;

      try {
        await fetch(`/api/exam/${attemptId}/violation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, details }),
        });
      } catch {
        // Silent fail
      }

      if (violationCount.current >= maxViolations && onMaxViolations) {
        onMaxViolations();
      }
    },
    [attemptId, maxViolations, onMaxViolations]
  );

  useEffect(() => {
    if (!enabled) return;

    // Page Visibility API — detect tab switch
    function handleVisibilityChange() {
      if (document.hidden) {
        logViolation("TAB_SWITCH", "User switched tab or minimized window");
      }
    }

    // Fullscreen exit detection
    function handleFullscreenChange() {
      if (!document.fullscreenElement) {
        logViolation("FULLSCREEN_EXIT", "User exited fullscreen mode");
      }
    }

    // Copy/paste prevention
    function handleCopy(e: ClipboardEvent) {
      e.preventDefault();
      logViolation("COPY_ATTEMPT", "User attempted to copy content");
    }

    function handlePaste(e: ClipboardEvent) {
      e.preventDefault();
      logViolation("PASTE_ATTEMPT", "User attempted to paste content");
    }

    // Right-click prevention
    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
      logViolation("CONTEXT_MENU", "User attempted to open context menu");
    }

    // Dev tools detection (basic)
    function handleKeyDown(e: KeyboardEvent) {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        logViolation("DEV_TOOLS", "User pressed F12");
      }
      // Ctrl+Shift+I / Cmd+Option+I
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "I" || e.key === "i")
      ) {
        e.preventDefault();
        logViolation("DEV_TOOLS", "User attempted to open dev tools");
      }
      // Ctrl+Shift+J / Cmd+Option+J (Console)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "J" || e.key === "j")
      ) {
        e.preventDefault();
        logViolation("DEV_TOOLS", "User attempted to open console");
      }
      // Ctrl+U / Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        logViolation("VIEW_SOURCE", "User attempted to view source");
      }
    }

    // Window blur detection
    function handleBlur() {
      logViolation("WINDOW_BLUR", "Window lost focus");
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);

    // Request fullscreen on start
    document.documentElement.requestFullscreen?.().catch(() => {
      // User might deny — that's OK
    });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);

      // Exit fullscreen when leaving
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, [enabled, logViolation]);

  return {
    violationCount: violationCount.current,
  };
}
