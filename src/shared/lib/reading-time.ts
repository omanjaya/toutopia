/** Average adult reading speed in words per minute */
const WPM = 250;

/** Average time to view a single image (seconds) */
const IMAGE_VIEW_SECONDS = 12;

interface ReadingTime {
  minutes: number;
  /** Formatted label, e.g. "±5 menit" or "±1 jam 20 menit" */
  label: string;
  /** Short label for tight spaces, e.g. "5 mnt" or "1j 20m" */
  short: string;
}

/**
 * Estimate reading time from raw HTML content.
 * Accounts for word count + image viewing time.
 */
export function estimateFromHtml(html: string | null): ReadingTime | null {
  if (!html) return null;

  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ").filter(Boolean).length;
  if (words < 50) return null;

  const imageMatches = html.match(/<img[\s\S]*?>/gi);
  const imageCount = imageMatches?.length ?? 0;

  const totalSeconds =
    Math.ceil(words / WPM) * 60 + imageCount * IMAGE_VIEW_SECONDS;

  return formatSeconds(totalSeconds);
}

/**
 * Estimate reading time from page count.
 * Assumes ~250 words per page, plus some overhead.
 */
export function estimateFromPages(pageCount: number | null): ReadingTime | null {
  if (!pageCount || pageCount < 1) return null;
  const totalSeconds = Math.ceil((pageCount * 250) / WPM) * 60;
  return formatSeconds(totalSeconds);
}

function formatSeconds(totalSeconds: number): ReadingTime {
  const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let label: string;
  let short: string;

  if (hours === 0) {
    label = `±${minutes} menit membaca`;
    short = `${minutes} mnt`;
  } else if (minutes === 0) {
    label = `±${hours} jam membaca`;
    short = `${hours}j`;
  } else {
    label = `±${hours} jam ${minutes} menit membaca`;
    short = `${hours}j ${minutes}m`;
  }

  return { minutes: totalMinutes, label, short };
}
