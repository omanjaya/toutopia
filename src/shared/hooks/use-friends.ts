"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface Friend {
  id: string;
  name: string;
  avatar: string | null;
}

export interface ComparisonItem {
  friendId: string;
  friend: Friend;
  myAvgScore: number;
  friendAvgScore: number;
  commonPackages: number;
  myTotalAttempts: number;
  friendTotalAttempts: number;
}

export interface PendingInvite {
  id: string;
  inviteCode: string;
  user: Friend;
}

export interface FriendsData {
  comparisons: ComparisonItem[];
  pendingInvites: PendingInvite[];
}

export interface UseFriendsReturn {
  data: FriendsData | null;
  loading: boolean;
  email: string;
  inviting: boolean;
  accepting: string | null;
  setEmail: (email: string) => void;
  handleInvite: () => Promise<void>;
  handleAccept: (inviteCode: string) => Promise<void>;
}

/**
 * Encapsulates all state and API interactions for the friends comparison feature.
 * Shared between desktop (FriendsContent) and mobile (MobileFriendsContent).
 */
export function useFriends(): UseFriendsReturn {
  const [data, setData] = useState<FriendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);

  async function fetchData(): Promise<void> {
    try {
      const res = await fetch("/api/friends");
      const result = await res.json();
      if (result.success) {
        setData(result.data as FriendsData);
      }
    } catch {
      toast.error("Gagal memuat data teman");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleInvite(): Promise<void> {
    if (!email.trim()) return;
    setInviting(true);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendEmail: email }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Undangan terkirim!");
        setEmail("");
        await fetchData();
      } else {
        toast.error(result.error?.message ?? "Gagal mengirim undangan");
      }
    } catch {
      toast.error("Gagal mengirim undangan");
    } finally {
      setInviting(false);
    }
  }

  async function handleAccept(inviteCode: string): Promise<void> {
    setAccepting(inviteCode);
    try {
      const res = await fetch("/api/friends", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Undangan diterima!");
        await fetchData();
      }
    } catch {
      toast.error("Gagal menerima undangan");
    } finally {
      setAccepting(null);
    }
  }

  return {
    data,
    loading,
    email,
    inviting,
    accepting,
    setEmail,
    handleInvite,
    handleAccept,
  };
}
