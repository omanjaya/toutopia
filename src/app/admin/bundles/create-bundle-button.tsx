"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { BundleFormDialog } from "./bundle-form-dialog";

export function CreateBundleButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Buat Bundle
      </Button>
      <BundleFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
