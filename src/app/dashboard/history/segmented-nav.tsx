"use client";

import { useRouter } from "next/navigation";
import { SegmentedControl } from "@/shared/components/ui/segmented-control";

interface SegmentedNavProps {
  options: { value: string; label: string }[];
  value: string;
  baseHref: string;
  paramKey: string;
}

export function SegmentedNav({ options, value, baseHref, paramKey }: SegmentedNavProps) {
  const router = useRouter();

  function handleChange(newValue: string) {
    const url =
      newValue === "all" || newValue === options[0]?.value
        ? baseHref
        : `${baseHref}?${paramKey}=${newValue}`;
    router.push(url);
  }

  return (
    <SegmentedControl
      options={options}
      value={value}
      onValueChange={handleChange}
    />
  );
}
