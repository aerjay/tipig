// Convert a long-form month ("April 2026") to "MM/YYYY" ("04/2026").
// Used for the date on home album cards (SPEC §6).
const MONTHS = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

export function formatTravelDate(s) {
  if (!s) return "";
  const parts = s.trim().split(/\s+/);
  if (parts.length === 2 && MONTHS[parts[0].toLowerCase()]) {
    return `${MONTHS[parts[0].toLowerCase()]}/${parts[1]}`;
  }
  return s;
}
