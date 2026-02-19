/**
 * Date, weight, and number display formatting utilities.
 */

/**
 * Format a date as a human-readable string (e.g., "Jan 15, 2025").
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "Yesterday").
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

/**
 * Format a timestamp as time only (e.g., "2:30 PM").
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format workout duration from start and end timestamps.
 */
export function formatDuration(startedAt: string, completedAt: string): string {
  const start = new Date(startedAt);
  const end = new Date(completedAt);
  const diffMs = end.getTime() - start.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMins}m`;
  }
  return `${minutes}m`;
}

/**
 * Format weight with unit (e.g., "135 lbs").
 */
export function formatWeight(weight: number, unit: string = "lbs"): string {
  if (weight % 1 === 0) return `${weight} ${unit}`;
  return `${weight.toFixed(1)} ${unit}`;
}

/**
 * Format a number with commas (e.g., 1,234).
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

/**
 * Format a percentage with optional decimal places.
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format reps display (e.g., "8 reps" or "1 rep").
 */
export function formatReps(reps: number): string {
  return `${reps} ${reps === 1 ? "rep" : "reps"}`;
}

/**
 * Format a set display (e.g., "135 × 8").
 */
export function formatSet(weight: number, reps: number): string {
  return `${weight} × ${reps}`;
}

/**
 * Format rest timer display (e.g., "1:30").
 */
export function formatRestTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
