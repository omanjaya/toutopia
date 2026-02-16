"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { ANTI_CHEAT } from "@/shared/lib/constants";

interface UseAntiCheatOptions {
  attemptId: string;
  enabled: boolean;
  maxViolations?: number;
  onMaxViolations?: () => void;
}

interface Violation {
  type: string;
  message: string;
  timestamp: Date;
}

export function useAntiCheat({
  attemptId,
  enabled,
  maxViolations = ANTI_CHEAT.MAX_VIOLATIONS_DEFAULT,
  onMaxViolations,
}: UseAntiCheatOptions) {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const violationCount = useRef(0);

  const logViolation = useCallback(
    async (type: string, message: string) => {
      violationCount.current += 1;
      const count = violationCount.current;
      const remaining = maxViolations - count;

      setViolations((prev) => [
        ...prev,
        { type, message, timestamp: new Date() },
      ]);

      // Show warning overlay
      if (remaining > 0) {
        setWarningMessage(
          `Peringatan ${count}/${maxViolations}: ${message}. Sisa kesempatan: ${remaining}`
        );
      } else {
        setWarningMessage(
          `Pelanggaran maksimum tercapai (${count}/${maxViolations}). Ujian akan otomatis diselesaikan.`
        );
      }
      setShowWarning(true);

      // Log to server
      try {
        await fetch(`/api/exam/${attemptId}/violation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, details: message }),
        });
      } catch {
        // Silent fail
      }

      if (count >= maxViolations && onMaxViolations) {
        // Small delay so user sees the final warning
        setTimeout(() => onMaxViolations(), 2000);
      }
    },
    [attemptId, maxViolations, onMaxViolations]
  );

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Page Visibility API — detect tab switch
    function handleVisibilityChange() {
      if (document.hidden) {
        logViolation(
          "TAB_SWITCH",
          "Kamu berpindah tab atau meminimalkan jendela browser"
        );
      }
    }

    // Window blur — detect focus loss (alt+tab, click outside)
    function handleBlur() {
      // Only trigger if not already from visibility change
      if (!document.hidden) {
        logViolation(
          "WINDOW_BLUR",
          "Jendela browser kehilangan fokus"
        );
      }
    }

    // Copy/paste prevention
    function handleCopy(e: ClipboardEvent) {
      e.preventDefault();
      logViolation("COPY_ATTEMPT", "Kamu mencoba menyalin konten");
    }

    function handlePaste(e: ClipboardEvent) {
      e.preventDefault();
      logViolation("PASTE_ATTEMPT", "Kamu mencoba menempel konten");
    }

    // Right-click prevention
    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
      logViolation("CONTEXT_MENU", "Kamu mencoba membuka menu konteks");
    }

    // Dev tools detection
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "F12") {
        e.preventDefault();
        logViolation("DEV_TOOLS", "Kamu mencoba membuka Developer Tools");
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "I" || e.key === "i")
      ) {
        e.preventDefault();
        logViolation("DEV_TOOLS", "Kamu mencoba membuka Developer Tools");
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "J" || e.key === "j")
      ) {
        e.preventDefault();
        logViolation("DEV_TOOLS", "Kamu mencoba membuka Console");
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        logViolation("VIEW_SOURCE", "Kamu mencoba melihat source code");
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled, logViolation]);

  return {
    violations,
    violationCount: violationCount.current,
    showWarning,
    warningMessage,
    dismissWarning,
  };
}
