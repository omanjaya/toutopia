const DB_NAME = "ToutopiaOffline";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("pendingSync")) {
                db.createObjectStore("pendingSync", { keyPath: "id", autoIncrement: true });
            }
            if (!db.objectStoreNames.contains("cachedQuestions")) {
                db.createObjectStore("cachedQuestions", { keyPath: "attemptId" });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export interface OfflineAnswer {
    attemptId: string;
    syncType: "answer" | "attempt_complete";
    data: {
        questionId: string;
        selectedOptionId?: string;
        selectedOptions?: string[];
        numericAnswer?: number;
        timeSpentSeconds?: number;
        isFlagged?: boolean;
    };
}

/**
 * Queue an answer for offline sync.
 * If online, syncs immediately. If offline, stores in IndexedDB
 * and registers a Background Sync.
 */
export async function queueOfflineAnswer(answer: OfflineAnswer): Promise<boolean> {
    const isOnline = navigator.onLine;

    if (isOnline) {
        try {
            const res = await fetch("/api/offline-sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: [answer] }),
            });
            return res.ok;
        } catch {
            // Fall through to offline storage
        }
    }

    // Store locally
    const db = await openDB();
    const tx = db.transaction("pendingSync", "readwrite");
    const store = tx.objectStore("pendingSync");
    store.add({ data: answer, createdAt: Date.now() });

    // Register background sync
    if ("serviceWorker" in navigator && "SyncManager" in window) {
        const registration = await navigator.serviceWorker.ready;
        await (registration as unknown as { sync: { register: (tag: string) => Promise<void> } })
            .sync.register("sync-offline-answers");
    }

    return false;
}

/**
 * Request the service worker to cache exam questions for offline use.
 */
export async function cacheExamOffline(attemptId: string): Promise<void> {
    if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.active?.postMessage({
            type: "CACHE_EXAM",
            attemptId,
        });
    }
}

/**
 * Get cached exam questions from IndexedDB.
 */
export async function getCachedExam(attemptId: string): Promise<unknown | null> {
    try {
        const db = await openDB();
        const tx = db.transaction("cachedQuestions", "readonly");
        const store = tx.objectStore("cachedQuestions");

        return new Promise((resolve, reject) => {
            const request = store.get(attemptId);
            request.onsuccess = () => resolve(request.result?.data ?? null);
            request.onerror = () => reject(request.error);
        });
    } catch {
        return null;
    }
}

/**
 * Get count of pending offline items.
 */
export async function getPendingSyncCount(): Promise<number> {
    try {
        const db = await openDB();
        const tx = db.transaction("pendingSync", "readonly");
        const store = tx.objectStore("pendingSync");

        return new Promise((resolve, reject) => {
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch {
        return 0;
    }
}

/**
 * Manually trigger sync of all pending items.
 * Call this when the app detects it came back online.
 */
export async function syncPendingItems(): Promise<boolean> {
    try {
        const db = await openDB();
        const tx = db.transaction("pendingSync", "readonly");
        const store = tx.objectStore("pendingSync");

        const items = await new Promise<Array<{ id: number; data: OfflineAnswer }>>((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        if (items.length === 0) return true;

        const res = await fetch("/api/offline-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: items.map((i) => i.data) }),
        });

        if (res.ok) {
            const deleteTx = db.transaction("pendingSync", "readwrite");
            const deleteStore = deleteTx.objectStore("pendingSync");
            for (const item of items) {
                deleteStore.delete(item.id);
            }
            return true;
        }

        return false;
    } catch {
        return false;
    }
}
