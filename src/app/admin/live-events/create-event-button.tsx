"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";
import { EventFormDialog } from "./event-form-dialog";

interface CreateEventButtonProps {
  packages: { id: string; title: string }[];
}

export function CreateEventButton({ packages }: CreateEventButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Buat Event
      </Button>

      <EventFormDialog
        open={open}
        onOpenChange={setOpen}
        packages={packages}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
