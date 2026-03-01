"use client";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { BundleFormDialog } from "./bundle-form-dialog";

interface Bundle {
  id: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  quarterlyPrice: number | null;
  yearlyPrice: number | null;
  isActive: boolean;
}

export function BundleEditButton({ bundle }: { bundle: Bundle }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <BundleFormDialog open={open} onOpenChange={setOpen} bundle={bundle} />
    </>
  );
}
