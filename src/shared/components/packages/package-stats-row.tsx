import { FileText, Clock, Users } from "lucide-react";

interface PackageStatsRowProps {
  totalQuestions: number;
  durationMinutes: number;
  participantCount: number;
}

export function PackageStatsRow({
  totalQuestions,
  durationMinutes,
  participantCount,
}: PackageStatsRowProps): React.ReactElement {
  return (
    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <FileText className="size-4" strokeWidth={1.5} />
        {totalQuestions} soal
      </span>
      <span className="flex items-center gap-1.5">
        <Clock className="size-4" strokeWidth={1.5} />
        {durationMinutes} menit
      </span>
      <span className="flex items-center gap-1.5">
        <Users className="size-4" strokeWidth={1.5} />
        {participantCount.toLocaleString("id-ID")} peserta
      </span>
    </div>
  );
}
