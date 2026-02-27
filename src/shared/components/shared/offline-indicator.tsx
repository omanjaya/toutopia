"use client";

import { useState, useEffect, useCallback } from "react";
import { WifiOff, Wifi, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { syncPendingItems, getPendingSyncCount } from "@/shared/lib/offline-store";

export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [syncing, setSyncing] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

    const checkPending = useCallback(async () => {
        const count = await getPendingSyncCount();
        setPendingCount(count);
    }, []);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        function handleOnline() {
            setIsOnline(true);
            setShowBanner(true);
            toast.success("Kembali online!");
            // Auto-sync
            handleSync();
            setTimeout(() => setShowBanner(false), 5000);
        }

        function handleOffline() {
            setIsOnline(false);
            setShowBanner(true);
            toast.warning("Kamu sedang offline. Jawaban akan disimpan lokal.");
        }

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Check pending items periodically
        checkPending();
        const interval = setInterval(checkPending, 30000); // every 30s

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            clearInterval(interval);
        };
    }, [checkPending]);

    async function handleSync(): Promise<void> {
        setSyncing(true);
        try {
            const success = await syncPendingItems();
            if (success) {
                setPendingCount(0);
                toast.success("Data offline berhasil disinkronkan!");
            } else {
                toast.error("Gagal menyinkronkan data");
            }
        } catch {
            toast.error("Gagal menyinkronkan data");
        } finally {
            setSyncing(false);
        }
    }

    // Don't show anything if online and no pending items
    if (isOnline && pendingCount === 0 && !showBanner) return null;

    return (
        <>
            {/* Offline banner */}
            {!isOnline && (
                <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
                    <WifiOff className="h-4 w-4" />
                    <span>Mode Offline — Jawaban disimpan lokal</span>
                    {pendingCount > 0 && (
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                            {pendingCount} pending
                        </span>
                    )}
                </div>
            )}

            {/* Sync button when online with pending items */}
            {isOnline && pendingCount > 0 && (
                <div className="fixed bottom-4 right-4 z-50">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className={cn(
                            "flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-primary/90",
                            syncing && "opacity-70"
                        )}
                    >
                        {syncing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        Sync {pendingCount} jawaban
                    </button>
                </div>
            )}

            {/* Came back online toast */}
            {isOnline && showBanner && pendingCount === 0 && (
                <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg animate-in slide-in-from-bottom-4">
                    <Wifi className="h-4 w-4" />
                    Kembali online
                </div>
            )}
        </>
    );
}
