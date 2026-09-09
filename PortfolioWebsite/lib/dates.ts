// Date-only values never pass through timezone-dependent Date.parse.
export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function dateISO(value: string): string | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  if (!iso && !us) return null;
  const [y, m, d] = iso ? [+iso[1], +iso[2], +iso[3]] : [+us![3], +us![1], +us![2]];
  if (y < 1000 || y > 9999 || m < 1 || m > 12 || d < 1 || d > new Date(y, m, 0).getDate()) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
export function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function inputDate(value: string) {
  const iso = dateISO(value);
  return iso ? `${iso.slice(5, 7)}/${iso.slice(8, 10)}/${iso.slice(0, 4)}` : value;
}
export function formatDate(value: string) {
  const iso = dateISO(value);
  if (iso) return `${months[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}, ${iso.slice(0, 4)}`;
  // Preserve incomplete historical records instead of inventing a day.
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return `${months[+value.slice(5) - 1]} ${value.slice(0, 4)}`;
  return value;
}
