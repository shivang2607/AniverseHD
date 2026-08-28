// Normalizes raw anime runtime values into a compact card label.
//
// The Jikan / provider APIs return duration in varied shapes:
//   - "24 min per ep"   (string with units)
//   - "1 hr 24 min"     (string with hours + minutes)
//   - 1440              (raw seconds, from some episode payloads)
//   - undefined / null  (unknown)
//
// A single consumer should not each re-implement this parsing, so it lives
// here as a pure function (easy to reason about and unit-test).
export function formatDuration(raw) {
  if (raw == null) return "NA";
  if (typeof raw === "number") return formatSeconds(raw);

  const text = String(raw).trim();
  if (!text) return "NA";

  // Fast path: plain "<n> min" (e.g. "24 min per ep", "24 minutes").
  const minMatch = text.match(/(\d+)\s*min/i);
  if (minMatch && /^\s*\d+\s*min/i.test(text)) return `${minMatch[1]}m`;

  // "<n> hr <m> min" style.
  const hrMatch = text.match(/(\d+)\s*hr/i);
  const hr = hrMatch ? Number(hrMatch[1]) : 0;
  const min = minMatch ? Number(minMatch[1]) : 0;
  if (hr > 0 || min > 0) {
    return [hr ? `${hr}h` : "", min ? `${min}m` : ""].filter(Boolean).join(" ");
  }

  // Unrecognized format — surface it as-is rather than guessing.
  return text;
}

function formatSeconds(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "NA";
  const totalMin = Math.round(seconds / 60);
  const hr = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  const label = [
    hr ? `${hr}h` : "",
    min ? `${min}m` : "",
  ].filter(Boolean).join(" ");
  return label || "0m";
}
