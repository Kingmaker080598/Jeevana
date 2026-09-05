import type { DocState, Member } from "./types";

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftedDate(today: Date, years = 0, months = 0, days = 0): string {
  const date = new Date(Date.UTC(today.getUTCFullYear() - years, today.getUTCMonth() - months, today.getUTCDate() - days));
  return isoDate(date);
}

export function ageInCompletedYears(birthDate: string, today: Date): number {
  const birth = new Date(`${birthDate}T00:00:00.000Z`);
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const birthdayPassed =
    today.getUTCMonth() > birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() >= birth.getUTCDate());
  if (!birthdayPassed) age -= 1;
  return age;
}

function docs(values: Record<string, DocState>): Record<string, DocState> {
  return values;
}

export function createSampleFamily(today: Date): Member[] {
  return [
    { id: "tata", name: "Venkata Rao", role: "Grandfather", birthDate: shiftedDate(today, 68), docs: docs({ birth: "no", aadhaar: "have", ration: "have", voter: "have", bank: "have", nominee: "no", pan: "have", insurance: "have", pension: "have" }) },
    { id: "amma", name: "Lakshmi", role: "Mother", birthDate: shiftedDate(today, 34), docs: docs({ birth: "have", aadhaar: "have", ration: "have", school: "have", voter: "have", bank: "have", nominee: "no", pan: "have", marriage: "have", insurance: "no" }) },
    { id: "sravani", name: "Sravani", role: "Daughter", birthDate: shiftedDate(today, 17, 3), docs: docs({ birth: "have", aadhaar: "have", ration: "have", school: "have", caste: "no" }) },
    { id: "baby", name: "Baby boy", role: "Born 12 days ago", birthDate: shiftedDate(today, 0, 0, 12), docs: docs({}) },
  ];
}
