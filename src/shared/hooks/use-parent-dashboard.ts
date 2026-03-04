"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { ParentData } from "@/shared/lib/parent-dashboard.types";

interface UseParentDashboardReturn {
  data: ParentData | null;
  loading: boolean;
  email: string;
  linking: boolean;
  selectedChild: string | null;
  setEmail: (email: string) => void;
  setSelectedChild: (id: string) => void;
  handleLink: () => Promise<void>;
}

export function useParentDashboard(): UseParentDashboardReturn {
  const [data, setData] = useState<ParentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [linking, setLinking] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  async function fetchData(): Promise<void> {
    try {
      const res = await fetch("/api/parent");
      const result = await res.json();
      if (result.success) {
        const parentData = result.data as ParentData;
        setData(parentData);
        if (parentData.children.length > 0 && !selectedChild) {
          setSelectedChild(parentData.children[0].child.id);
        }
      }
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLink(): Promise<void> {
    if (!email.trim()) return;
    setLinking(true);
    try {
      const res = await fetch("/api/parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childEmail: email }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Undangan terkirim! Menunggu persetujuan anak.");
        setEmail("");
        await fetchData();
      } else {
        toast.error(result.error?.message ?? "Gagal menautkan");
      }
    } catch {
      toast.error("Gagal menautkan");
    } finally {
      setLinking(false);
    }
  }

  return {
    data,
    loading,
    email,
    linking,
    selectedChild,
    setEmail,
    setSelectedChild,
    handleLink,
  };
}
