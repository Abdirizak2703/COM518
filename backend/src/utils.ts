export function isYYMMDD(raw: string): boolean {
  return /^\d{6}$/.test(raw);
}

export function isPastYYMMDD(raw: string): boolean {
  const yy = Number(raw.slice(0, 2));
  const mm = Number(raw.slice(2, 4));
  const dd = Number(raw.slice(4, 6));

  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return true;
  }

  const year = 2000 + yy;
  const date = new Date(Date.UTC(year, mm - 1, dd));

  // Reject invalid dates like 250231 by checking round-trip components.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== mm - 1 ||
    date.getUTCDate() !== dd
  ) {
    return true;
  }

  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  return date.getTime() < todayUTC.getTime();
}
