"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { LiveEventItem, LiveEventTabType } from "@/shared/lib/live-events.types";

interface UseLiveEventsReturn {
  events: LiveEventItem[];
  loading: boolean;
  activeTab: LiveEventTabType;
  registering: string | null;
  setActiveTab: (tab: LiveEventTabType) => void;
  handleRegister: (eventId: string) => Promise<void>;
}

export function useLiveEvents(): UseLiveEventsReturn {
  const [events, setEvents] = useState<LiveEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LiveEventTabType>("upcoming");
  const [registering, setRegistering] = useState<string | null>(null);

  const fetchEvents = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/live-events?status=${activeTab}`);
      const result = await res.json();
      if (result.success) {
        setEvents(result.data as LiveEventItem[]);
      }
    } catch {
      toast.error("Gagal memuat jadwal event");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  async function handleRegister(eventId: string): Promise<void> {
    setRegistering(eventId);
    try {
      const res = await fetch(`/api/live-events/${eventId}`, {
        method: "POST",
      });
      const result = await res.json();
      if (result.success) {
        toast.success(
          "Berhasil mendaftar! Kamu akan diingatkan sebelum event dimulai.",
        );
        await fetchEvents();
      } else {
        toast.error(result.error?.message ?? "Gagal mendaftar");
      }
    } catch {
      toast.error("Gagal mendaftar");
    } finally {
      setRegistering(null);
    }
  }

  return { events, loading, activeTab, registering, setActiveTab, handleRegister };
}
