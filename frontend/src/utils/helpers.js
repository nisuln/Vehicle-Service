// ─── HELPERS ──────────────────────────────────────────────────────────────────

export const statusLabel = (s) =>
  ({
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
  })[s] || s;

export const fmt = (n) =>
  n?.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const initials = (name) =>
  name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
